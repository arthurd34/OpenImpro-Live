require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

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
    allowNewJoins: true
};

const persist = () => dbManager.saveState(state);

const showConfig = {
    lang: "fr", // Default language
    scenes: [
        { id: 'CONNECTION', title: "Connexion", type: "CONNECT", params: { url: "http://url.lol" } },
        { id: 'WAITING', title: "Logo / Waiting", type: "WAITING", params: { titleDisplay: "Attente..."} },
        { id: 'PROPOSAL', title: "Crazy Blind Test", type: "PROPOSAL", params: { theme: "Quel est la chanson ?", maxProposals: 1 } },
        { id: 'PROMO', title: "Promotion", type: "PROMO", params: { titleDisplay: "Instant promotionnel !" } },
    ]
};

// --- HELPERS ---

/**
 * Prepares the synchronization data sent to all clients
 * Includes current scene, playlist and UI translations
 */
const getSyncData = () => ({
    currentScene: showConfig.scenes[state.currentSceneIndex],
    currentIndex: state.currentSceneIndex,
    playlist: showConfig.scenes,
    // Ensure we fallback to 'fr' if language in config is missing
    ui: translations[showConfig.lang] || translations['fr']
});

const refreshAdminLists = () => {
    io.to('admin_room').emit('admin_user_list', state.activeUsers);
    io.to('admin_room').emit('admin_pending_list', state.pendingRequests);
};

const getContext = () => ({
    currentScene: showConfig.scenes[state.currentSceneIndex],
    ...state,
    refreshAdminLists,
    getSyncData,
    setAllProposals: (val) => { state.allProposals = val; persist(); },
    setActiveUsers: (val) => { state.activeUsers = val; persist(); },
    setPendingRequests: (val) => { state.pendingRequests = val; persist(); }
});

io.on('connection', (socket) => {
    // --- CRITICAL FIX: Send state immediately on connection ---
    // This prevents "white screen" on frontend by providing translations right away
    socket.emit('sync_state', getSyncData());

    socket.on('admin_toggle_joins', (value) => {
        state.allowNewJoins = value;
        persist();
        io.to('admin_room').emit('admin_joins_status', state.allowNewJoins);
    });

    socket.on('admin_login', (password) => {
        if (password === process.env.ADMIN_PASSWORD) {
            socket.join('admin_room');
            socket.emit('login_success');
            socket.emit('sync_state', getSyncData());
            refreshAdminLists();
            socket.emit('admin_sync_proposals', state.allProposals);
            socket.emit('admin_joins_status', state.allowNewJoins);
        }
    });

    // --- ADMIN ACTIONS ---
    socket.on('admin_approve_user', (data) => adminManager.approveUser(socket, io, data, getContext()));
    socket.on('admin_kick_user', (data) => adminManager.kickUser(socket, io, data, getContext()));
    socket.on('admin_rename_user', (data) => adminManager.renameUser(socket, io, data, getContext()));

    socket.on('admin_set_scene', (index) => {
        state.currentSceneIndex = index;
        persist();
        // Broadcast new scene state to everyone
        io.emit('sync_state', getSyncData());
    });

    // --- SCENE EVENTS (DELEGATED) ---
    const sceneEvents = ['send_proposal', 'admin_approve_proposal', 'admin_delete_proposal', 'admin_clear_all_proposals'];
    sceneEvents.forEach(event => {
        socket.on(event, (data) => sceneManager.handleEvent(socket, io, event, data, getContext()));
    });

    // --- JOIN & RECONNECT LOGIC ---
    socket.on('join_request', (data) => {
        const nameLower = data.name.trim().toLowerCase();
        const existingUser = state.activeUsers.find(u => u.name.toLowerCase() === nameLower);

        // Handle Reconnection
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
                // Return i18n key instead of raw text
                socket.emit('status_update', { status: 'session_expired', reason: "ERROR_SESSION_EXPIRED" });
            }
            return;
        }

        // Check if joins are allowed
        if (!state.allowNewJoins) {
            return socket.emit('status_update', {
                status: 'rejected',
                reason: "ERROR_JOINS_CLOSED"
            });
        }

        // Check if name is taken
        const isAlreadyPending = state.pendingRequests.find(u => u.name.toLowerCase() === nameLower);
        if (existingUser || isAlreadyPending) {
            return socket.emit('status_update', {
                status: 'rejected',
                reason: "ERROR_NAME_TAKEN"
            });
        }

        // Create pending request
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