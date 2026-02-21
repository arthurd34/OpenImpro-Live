require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const crypto = require('crypto');

const dbManager = require('./db');
const sceneManager = require('./scenes');
const adminManager = require('./admin');
const translations = require("./i18n");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// --- INITIAL STATE & PERSISTENCE ---
const savedState = dbManager.loadState();
let state = savedState || {
    currentSceneIndex: 0,
    activeUsers: [],
    pendingRequests: [],
    allProposals: [],
    adminTokens: [],
    allowNewJoins: true
};

if (!state.adminTokens) state.adminTokens = [];

const persist = () => dbManager.saveState(state);

const showConfig = {
    lang: "fr",
    scenes: [
        { id: 'CONNECTION', title: "Connexion", type: "CONNECT", params: { url: "http://url.lol" } },
        { id: 'WAITING', title: "Logo / Waiting", type: "WAITING", params: { titleDisplay: "Attente..."} },
        { id: 'PROPOSAL', title: "Crazy Blind Test", type: "PROPOSAL", params: { theme: "Quel est la chanson ?", maxProposals: 1 } },
        { id: 'PROMO', title: "Promotion", type: "PROMO", params: { titleDisplay: "Instant promotionnel !" } },
    ]
};

// --- HELPERS ---

/**
 * Validates if the provided token belongs to a persistent admin session
 */
const isValidAdmin = (token) => state.adminTokens && state.adminTokens.includes(token);

/**
 * Prepares synchronization data for all clients
 */
const getSyncData = () => ({
    currentScene: showConfig.scenes[state.currentSceneIndex],
    currentIndex: state.currentSceneIndex,
    playlist: showConfig.scenes,
    ui: translations[showConfig.lang] || translations['fr']
});

/**
 * Broadcasts updated lists to the admin room
 */
const refreshAdminLists = () => {
    io.to('admin_room').emit('admin_user_list', state.activeUsers);
    io.to('admin_room').emit('admin_pending_list', state.pendingRequests);
};

/**
 * Global context for scene and admin managers
 */
const getContext = () => ({
    currentScene: showConfig.scenes[state.currentSceneIndex],
    ...state,
    refreshAdminLists,
    getSyncData,
    setAllProposals: (val) => { state.allProposals = val; persist(); },
    setActiveUsers: (val) => { state.activeUsers = val; persist(); },
    setPendingRequests: (val) => { state.pendingRequests = val; persist(); }
});

/**
 * Security wrapper for admin-only socket events
 */
const adminAction = (callback) => (data) => {
    if (data && data.token && isValidAdmin(data.token)) {
        callback(data);
    } else {
        console.warn("Unauthorized admin action blocked.");
    }
};

io.on('connection', (socket) => {
    socket.emit('sync_state', getSyncData());

    // --- ADMIN AUTHENTICATION ---
    socket.on('admin_login', (data) => {
        const { password, token } = (typeof data === 'string') ? { password: data } : data;

        if (password && password === process.env.ADMIN_PASSWORD) {
            const newToken = crypto.randomBytes(32).toString('hex');
            state.adminTokens.push(newToken);
            if (state.adminTokens.length > 50) state.adminTokens.shift();
            persist();

            socket.join('admin_room');
            socket.emit('login_success', { token: newToken });
            socket.emit('sync_state', getSyncData());
            refreshAdminLists();
            socket.emit('admin_sync_proposals', state.allProposals);
            socket.emit('admin_joins_status', state.allowNewJoins);
            return;
        }

        if (token && isValidAdmin(token)) {
            socket.join('admin_room');
            socket.emit('login_success', { token });
            socket.emit('sync_state', getSyncData());
            refreshAdminLists();
            socket.emit('admin_sync_proposals', state.allProposals);
            socket.emit('admin_joins_status', state.allowNewJoins);
            return;
        }
        socket.emit('login_error', 'Invalid credentials');
    });

    // --- PROTECTED ADMIN ACTIONS ---
    socket.on('admin_toggle_joins', adminAction((data) => {
        state.allowNewJoins = data.value;
        persist();
        io.to('admin_room').emit('admin_joins_status', state.allowNewJoins);
    }));

    socket.on('admin_approve_user', adminAction((data) => adminManager.approveUser(socket, io, data, getContext())));
    socket.on('admin_kick_user', adminAction((data) => adminManager.kickUser(socket, io, data, getContext())));
    socket.on('admin_rename_user', adminAction((data) => adminManager.renameUser(socket, io, data, getContext())));
    socket.on('admin_set_scene', adminAction((data) => {
        state.currentSceneIndex = data.index;
        persist();
        io.emit('sync_state', getSyncData());
    }));

    // --- SCENE EVENTS ---
    const sceneEvents = ['send_proposal', 'admin_approve_proposal', 'admin_delete_proposal', 'admin_clear_all_proposals'];
    sceneEvents.forEach(event => {
        socket.on(event, (data) => sceneManager.handleEvent(socket, io, event, data, getContext()));
    });

    // --- PUBLIC JOIN & SECURE RECONNECT LOGIC ---
    socket.on('join_request', (data) => {
        // CASE 1: Reconnection with Token (Security)
        if (data.isReconnect && data.token) {
            const existingUser = state.activeUsers.find(u => u.token === data.token);

            if (existingUser) {
                existingUser.socketId = socket.id;
                existingUser.connected = true;
                persist();

                socket.emit('status_update', {
                    status: 'approved',
                    name: existingUser.name,
                    token: existingUser.token // Send back to confirm
                });
                socket.emit('sync_state', getSyncData());
                socket.emit('user_history_update', existingUser.proposals || []);
                refreshAdminLists();
                return;
            } else {
                return socket.emit('status_update', { status: 'session_expired', reason: "ERROR_SESSION_EXPIRED" });
            }
        }

        // CASE 2: New Join Request
        if (!state.allowNewJoins) {
            return socket.emit('status_update', { status: 'rejected', reason: "ERROR_JOINS_CLOSED" });
        }

        const nameLower = data.name ? data.name.trim().toLowerCase() : "";
        if (!nameLower) return;

        const isNameTaken = state.activeUsers.some(u => u.name.toLowerCase() === nameLower) ||
            state.pendingRequests.some(r => r.name.toLowerCase() === nameLower);

        if (isNameTaken) {
            return socket.emit('status_update', { status: 'rejected', reason: "ERROR_NAME_TAKEN" });
        }

        // Generate a unique token for this specific player
        const userToken = crypto.randomBytes(16).toString('hex');
        const req = {
            socketId: socket.id,
            name: data.name.trim(),
            token: userToken,
            connected: true,
            proposals: []
        };

        state.pendingRequests.push(req);
        persist();

        // Send token to the player immediately so they can save it
        socket.emit('status_update', { status: 'pending', token: userToken });
        io.to('admin_room').emit('admin_new_request', req);
    });

    socket.on('disconnect', () => {
        const user = state.activeUsers.find(u => u.socketId === socket.id);
        if (user) {
            user.connected = false;
            persist();
        }
        const wasPending = state.pendingRequests.some(r => r.socketId === socket.id);
        if (wasPending) {
            state.pendingRequests = state.pendingRequests.filter(r => r.socketId !== socket.id);
            persist();
        }
        refreshAdminLists();
    });
});

server.listen(process.env.PORT || 3000, () => console.log("Server Ready"));