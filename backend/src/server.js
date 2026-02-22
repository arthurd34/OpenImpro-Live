// backend/src/server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const crypto = require('crypto');
const fs = require('fs-extra'); // Using fs-extra for better promise support
const path = require('path');
const cors = require('cors');
const fileUpload = require('express-fileupload'); // Required for ZIP uploads

const dbManager = require('./db');
const sceneManager = require('./scenes');
const adminManager = require('./admin');
const ShowManager = require('./showManager'); // New manager for ZIP/Files
const translations = require("./i18n");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// --- CONFIGURATION CORS ---
// On autorise tout pour le développement, ou on cible l'origine précise
app.use(cors({
    origin: "http://localhost:5173", // L'adresse de ton frontend Vite
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "x-admin-token"] // Important: autorise ton header perso !
}));

// Middleware for handling file uploads (ZIP packs)
app.use(fileUpload());

// --- INITIAL STATE & PERSISTENCE ---
const savedState = dbManager.loadState();
let state = savedState || {
    activeShowId: null,      // Name of the show folder
    isLive: false,           // Show access toggle
    currentSceneIndex: 0,
    activeUsers: [],
    pendingRequests: [],
    allProposals: [],
    adminTokens: [],
    allowNewJoins: true
};

if (!state.adminTokens) state.adminTokens = [];

// Global config object that holds current show data
let showConfig = {
    name: "No show loaded",
    lang: "fr",
    scenes: [{ id: 'OFFLINE', title: "Offline", type: "WAITING", params: {} }]
};

const persist = () => dbManager.saveState(state);

// --- SHOW MANAGEMENT HELPERS ---

/**
 * Load a show configuration from the persistent storage
 * Looks for config.json inside the show's specific folder
 */
const loadShowConfig = (showId) => {
    try {
        const configPath = path.join(__dirname, '..', 'shows', showId, 'config.json');
        if (fs.existsSync(configPath)) {
            const fileData = fs.readFileSync(configPath, 'utf8');
            showConfig = JSON.parse(fileData);
            console.log(`[ShowManager] Loaded: ${showConfig.name}`);
        }
    } catch (err) {
        console.error(`[ShowManager] Error loading config for ${showId}:`, err);
    }
};

// Initial load if a show was active
if (state.activeShowId) {
    loadShowConfig(state.activeShowId);
}

const getSyncData = () => {
    if (!state.isLive) {
        return {
            isLive: false,
            ui: translations[showConfig.lang] || translations['fr'],
            currentScene: { id: 'OFFLINE', type: 'WAITING', params: { titleDisplay: "SHOW_NOT_STARTED" } }
        };
    }

    return {
        isLive: true,
        currentScene: showConfig.scenes[state.currentSceneIndex],
        currentIndex: state.currentSceneIndex,
        playlist: showConfig.scenes,
        ui: translations[showConfig.lang] || translations['fr']
    };
};

const isValidAdmin = (token) => state.adminTokens && state.adminTokens.includes(token);

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

const adminAction = (callback) => (data) => {
    if (data && data.token && isValidAdmin(data.token)) {
        callback(data);
    } else {
        console.warn("Unauthorized admin action attempt blocked.");
    }
};

// --- HTTP ROUTES (FOR FILE UPLOADS) ---

/**
 * Route to upload a Show Pack (ZIP)
 * Using HTTP because ZIP files can be large for Socket.io
 */
app.post('/admin/upload-show', async (req, res) => {
    const token = req.headers['x-admin-token'];
    if (!isValidAdmin(token)) return res.status(401).send('Unauthorized');

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files uploaded');
    }

    try {
        const uploadedFile = Object.values(req.files)[0];

        if (!uploadedFile.name.endsWith('.zip')) {
            return res.status(400).send('Only ZIP files are allowed');
        }

        const showId = await ShowManager.uploadShow(uploadedFile);
        res.send({ success: true, showId });
    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).send({ error: err.message });
    }
});

// --- SOCKET EVENTS ---

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
            socket.emit('admin_live_status', state.isLive);
            return;
        }

        if (token && isValidAdmin(token)) {
            socket.join('admin_room');
            socket.emit('login_success', { token });
            socket.emit('sync_state', getSyncData());
            refreshAdminLists();
            socket.emit('admin_sync_proposals', state.allProposals);
            socket.emit('admin_joins_status', state.allowNewJoins);
            socket.emit('admin_live_status', state.isLive);
            return;
        }
        socket.emit('login_error', 'ERROR_INVALID_CREDENTIALS');
    });

    // --- PROTECTED ADMIN ACTIONS ---

    // Get the list of installed shows
    socket.on('admin_get_shows', adminAction(async () => {
        const shows = await ShowManager.listShows();
        socket.emit('admin_shows_list', shows);
    }));

    // Delete a show pack
    socket.on('admin_delete_show', adminAction(async (data) => {
        await ShowManager.deleteShow(data.showId);
        const shows = await ShowManager.listShows();
        socket.emit('admin_shows_list', shows);
    }));

    socket.on('admin_load_show', adminAction((data) => {
        loadShowConfig(data.showId);
        state.activeShowId = data.showId;
        state.currentSceneIndex = 0;
        state.isLive = false;
        persist();
        io.emit('sync_state', getSyncData());
    }));

    socket.on('admin_toggle_live', adminAction((data) => {
        state.isLive = data.value;
        persist();
        io.emit('sync_state', getSyncData());
    }));

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

    // --- PUBLIC JOIN & RECONNECT LOGIC ---
    socket.on('join_request', (data) => {
        if (!state.isLive && !data.isReconnect) {
            return socket.emit('status_update', { status: 'rejected', reason: "ERROR_SHOW_NOT_STARTED" });
        }

        if (data.isReconnect && data.token) {
            const existingUser = state.activeUsers.find(u => u.token === data.token);
            if (existingUser) {
                existingUser.socketId = socket.id;
                existingUser.connected = true;
                persist();
                socket.emit('status_update', { status: 'approved', name: existingUser.name, token: existingUser.token });
                socket.emit('sync_state', getSyncData());
                socket.emit('user_history_update', existingUser.proposals || []);
                refreshAdminLists();
                return;
            } else {
                return socket.emit('status_update', { status: 'session_expired', reason: "ERROR_SESSION_EXPIRED" });
            }
        }

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

        const userToken = crypto.randomBytes(16).toString('hex');
        const req = { socketId: socket.id, name: data.name.trim(), token: userToken, connected: true, proposals: [] };

        state.pendingRequests.push(req);
        persist();

        socket.emit('status_update', { status: 'pending', token: userToken });
        io.to('admin_room').emit('admin_new_request', req);
    });

    socket.on('disconnect', () => {
        const user = state.activeUsers.find(u => u.socketId === socket.id);
        if (user) { user.connected = false; persist(); }
        const wasPending = state.pendingRequests.some(r => r.socketId === socket.id);
        if (wasPending) {
            state.pendingRequests = state.pendingRequests.filter(r => r.socketId !== socket.id);
            persist();
        }
        refreshAdminLists();
    });
});

server.listen(process.env.PORT || 3000, () => console.log("Server Ready"));