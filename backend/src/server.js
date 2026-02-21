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
    adminTokens: [], // Persistent storage for admin sessions
    allowNewJoins: true
};

// If state was loaded but missing adminTokens array, initialize it
if (!state.adminTokens) state.adminTokens = [];

const persist = () => dbManager.saveState(state);

const showConfig = {
    lang: "fr", // Global language setting
    scenes: [
        { id: 'CONNECTION', title: "Connexion", type: "CONNECT", params: { url: "http://url.lol" } },
        { id: 'WAITING', title: "Logo / Waiting", type: "WAITING", params: { titleDisplay: "Attente..."} },
        { id: 'PROPOSAL', title: "Crazy Blind Test", type: "PROPOSAL", params: { theme: "Quel est la chanson ?", maxProposals: 1 } },
        { id: 'PROMO', title: "Promotion", type: "PROMO", params: { titleDisplay: "Instant promotionnel !" } },
    ]
};

// --- HELPERS ---

/**
 * Checks if a token exists in the persistent admin tokens list
 * @param {string} token
 * @returns {boolean}
 */
const isValidAdmin = (token) => state.adminTokens && state.adminTokens.includes(token);

/**
 * Prepares the synchronization data for clients
 */
const getSyncData = () => ({
    currentScene: showConfig.scenes[state.currentSceneIndex],
    currentIndex: state.currentSceneIndex,
    playlist: showConfig.scenes,
    ui: translations[showConfig.lang] || translations['en']
});

/**
 * Updates admin room with latest user and request lists
 */
const refreshAdminLists = () => {
    io.to('admin_room').emit('admin_user_list', state.activeUsers);
    io.to('admin_room').emit('admin_pending_list', state.pendingRequests);
};

/**
 * Context object shared with managers
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
 * Middleware wrapper to verify admin token against persistent state
 */
const adminAction = (callback) => (data) => {
    if (data && data.token && isValidAdmin(data.token)) {
        callback(data);
    } else {
        console.warn("Unauthorized admin action attempt blocked.");
    }
};

io.on('connection', (socket) => {
    // Send initial state immediately for UI translations
    socket.emit('sync_state', getSyncData());

    // --- ADMIN AUTHENTICATION ---
    socket.on('admin_login', (data) => {
        const { password, token } = (typeof data === 'string') ? { password: data } : data;

        // Login via password (initial)
        if (password && password === process.env.ADMIN_PASSWORD) {
            const newToken = crypto.randomBytes(32).toString('hex');

            // Persist token in state
            state.adminTokens.push(newToken);
            // Optional: Limit number of stored tokens to 50 to keep DB clean
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

        // Login via token (reconnection/remember me) from DB
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

    // --- SCENE EVENTS (DELEGATED) ---
    const sceneEvents = ['send_proposal', 'admin_approve_proposal', 'admin_delete_proposal', 'admin_clear_all_proposals'];
    sceneEvents.forEach(event => {
        socket.on(event, (data) => sceneManager.handleEvent(socket, io, event, data, getContext()));
    });

    // --- PUBLIC JOIN & RECONNECT LOGIC ---
    socket.on('join_request', (data) => {
        const nameLower = data.name.trim().toLowerCase();
        const existingUser = state.activeUsers.find(u => u.name.toLowerCase() === nameLower);

        if (data.isReconnect) {
            if (existingUser) {
                existingUser.socketId = socket.id;
                existingUser.connected = true;
                persist();
                socket.emit('status_update', { status: 'approved', name: existingUser.name });
                socket.emit('sync_state', getSyncData());
                socket.emit('user_history_update', existingUser.proposals || []);
                refreshAdminLists();
            } else {
                socket.emit('status_update', { status: 'session_expired', reason: "ERROR_SESSION_EXPIRED" });
            }
            return;
        }

        if (!state.allowNewJoins) {
            return socket.emit('status_update', { status: 'rejected', reason: "ERROR_JOINS_CLOSED" });
        }

        const isAlreadyPending = state.pendingRequests.find(u => u.name.toLowerCase() === nameLower);
        if (existingUser || isAlreadyPending) {
            return socket.emit('status_update', { status: 'rejected', reason: "ERROR_NAME_TAKEN" });
        }

        const req = { socketId: socket.id, name: data.name, connected: true, proposals: [] };
        state.pendingRequests.push(req);
        persist();
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