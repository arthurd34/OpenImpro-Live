require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const dbManager = require('./db');
const sceneManager = require('./scenes');
const adminManager = require('./admin');

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
    scenes: [
        { id: 'CONNECTION', title: "Connexion", type: "CONNECT", params: { url: "http://url.lol" } },
        { id: 'WAITING', title: "Logo / Waiting", type: "WAITING", params: { titleDisplay: "Attente..."} },
        { id: 'PROPOSAL', title: "Crazy Blind Test", type: "PROPOSAL", params: { theme: "Quel est la chanson ?", maxProposals: 1 } },
        { id: 'PROMO', title: "Promotion", type: "PROMO", params: { titleDisplay: "Instant promotionnel !" } },
    ]
};

// --- HELPERS ---
const getSyncData = () => ({
    currentScene: showConfig.scenes[state.currentSceneIndex],
    currentIndex: state.currentSceneIndex,
    playlist: showConfig.scenes
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
    // State setters to ensure persistence when modified from external managers
    setAllProposals: (val) => { state.allProposals = val; persist(); },
    setActiveUsers: (val) => { state.activeUsers = val; persist(); },
    setPendingRequests: (val) => { state.pendingRequests = val; persist(); }
});

io.on('connection', (socket) => {

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
                socket.emit('status_update', { status: 'session_expired', reason: "Session expired." });
            }
            return;
        }

        if (!state.allowNewJoins) {
            return socket.emit('status_update', {
                status: 'rejected',
                reason: "Les inscriptions sont actuellement fermées. Veuillez réessayer plus tard."
            });
        }

        const isAlreadyPending = state.pendingRequests.find(u => u.name.toLowerCase() === nameLower);
        if (existingUser || isAlreadyPending) {
            return socket.emit('status_update', {
                status: 'rejected',
                reason: `Le nom "${data.name}" est déjà pris.`
            });
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