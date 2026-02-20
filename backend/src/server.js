require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let currentSceneIndex = 0;
let activeUsers = [];
let pendingRequests = [];
let allProposals = [];

const showConfig = {
    scenes: [
        {
            id: 'CONNECTION', title: "Connexion", type: "CONNECT", params: {
                url: "http://url.lol",
            }
        },
        {
            id: 'WAITING', title: "Logo / Waiting", type: "WAITING", params: {
                titleDisplay: "Quel est la chanson jouée ?",
                maxProposals: 1,
            }
        },
        {
            id: 'PROPOSAL', title: "Crazy Blind Test", type: "PROPOSAL", params: {
                theme: "Quel est la chanson jouée ?",
                maxProposals: 1,
            }
        },
        {
            id: 'PROMO', title: "Promotion", type: "PROMO", params: {
                titleDisplay: "Instant promotionnel !"
            }
        },
    ]
};

// --- HELPERS ---
function getSyncData() {
    return { currentScene: showConfig.scenes[currentSceneIndex], currentIndex: currentSceneIndex, playlist: showConfig.scenes };
}

function sendSync(target) { target.emit('sync_state', getSyncData()); }

function refreshAdminLists() {
    io.to('admin_room').emit('admin_user_list', activeUsers);
    io.to('admin_room').emit('admin_pending_list', pendingRequests);
}

// --- SOCKET LOGIC ---
io.on('connection', (socket) => {

    socket.on('admin_login', (password) => {
        if (password === process.env.ADMIN_PASSWORD) {
            socket.join('admin_room');
            socket.emit('login_success');
            socket.emit('sync_state', getSyncData());
            socket.emit('admin_user_list', activeUsers);
            socket.emit('admin_pending_list', pendingRequests);
            socket.emit('admin_sync_proposals', allProposals);
        }
    });

    socket.on('join_request', (data) => {
        const nameLower = data.name.trim().toLowerCase();
        const existingUser = activeUsers.find(u => u.name.toLowerCase() === nameLower);

        if (data.isReconnect) {
            if (existingUser) {
                existingUser.socketId = socket.id;
                existingUser.connected = true;
                socket.emit('status_update', { status: 'approved', name: existingUser.name });
                socket.emit('sync_state', getSyncData());
                socket.emit('user_history_update', existingUser.proposals || []);
                refreshAdminLists();
            } else {
                socket.emit('status_update', { status: 'session_expired', reason: "Session expirée." });
            }
        } else {
            const nameExists = existingUser || pendingRequests.find(u => u.name.toLowerCase() === nameLower);
            if (nameExists) {
                return socket.emit('status_update', { status: 'rejected', reason: `Le nom "${data.name}" est déjà pris.` });
            }
            const req = { socketId: socket.id, name: data.name, connected: true, proposals: [] };
            pendingRequests.push(req);
            io.to('admin_room').emit('admin_new_request', req);
        }
    });

    socket.on('admin_approve_user', ({ socketId, welcomeMessage }) => {
        const userReq = pendingRequests.find(r => r.socketId === socketId);
        if (userReq) {
            pendingRequests = pendingRequests.filter(r => r.socketId !== socketId);
            activeUsers.push(userReq);
            io.to(socketId).emit('status_update', { status: 'approved', message: welcomeMessage });
            io.to(socketId).emit('sync_state', getSyncData());
            refreshAdminLists();
        }
    });

    socket.on('send_proposal', (data) => {
        const user = activeUsers.find(u => u.name === data.userName);
        if (!user) return;

        if (user.proposals.length >= 5) {
            return socket.emit('status_update', { status: 'approved', message: "Limite de 5 réponses atteinte !" });
        }

        const newProposal = {
            id: Date.now(),
            userName: data.userName,
            text: data.text,
            timestamp: new Date().toLocaleTimeString('fr-FR', { hour12: false }),
            isWinner: false
        };

        user.proposals.push(newProposal);
        allProposals.push(newProposal);

        io.to('admin_room').emit('admin_new_proposal', newProposal);
        socket.emit('user_history_update', user.proposals);
    });

    socket.on('admin_approve_proposal', (ans) => {
        const winnerGlobal = allProposals.find(a => a.id === ans.id);
        if (winnerGlobal) winnerGlobal.isWinner = true;

        const user = activeUsers.find(u => u.name === ans.userName);
        if (user && user.proposals) {
            const winnerLocal = user.proposals.find(a => a.id === ans.id);
            if (winnerLocal) winnerLocal.isWinner = true;
            io.to(user.socketId).emit('user_history_update', user.proposals);
        }

        io.emit('show_on_screen', winnerGlobal || ans);
        io.to('admin_room').emit('admin_sync_proposals', allProposals);
    });

    socket.on('admin_delete_proposal', (proposalId) => {
        allProposals = allProposals.filter(a => a.id !== proposalId);
        activeUsers.forEach(u => {
            if(u.proposals) {
                u.proposals = u.proposals.filter(a => a.id !== proposalId);
                io.to(u.socketId).emit('user_history_update', u.proposals);
            }
        });
        io.to('admin_room').emit('admin_sync_proposals', allProposals);
    });

    socket.on('admin_clear_all_proposals', () => {
        allProposals = [];
        activeUsers.forEach(u => {
            u.proposals = [];
            io.to(u.socketId).emit('user_history_update', []);
        });
        io.to('admin_room').emit('admin_sync_proposals', []);
    });

    socket.on('admin_kick_user', ({ socketId, reason, isRefusal }) => {
        const user = activeUsers.find(u => u.socketId === socketId);
        if (user) {
            allProposals = allProposals.filter(a => a.userName !== user.name);
            io.to('admin_room').emit('admin_sync_proposals', allProposals);
        }
        io.to(socketId).emit('status_update', { status: isRefusal ? 'rejected' : 'kicked', reason: reason || "Sceneion Admin" });
        activeUsers = activeUsers.filter(u => u.socketId !== socketId);
        pendingRequests = pendingRequests.filter(u => u.socketId !== socketId);
        refreshAdminLists();
        setTimeout(() => {
            const target = io.sockets.sockets.get(socketId);
            if (target) target.disconnect();
        }, 500);
    });

    socket.on('admin_set_act', (index) => {
        currentSceneIndex = index;
        io.emit('sync_state', getSyncData());
    });

    socket.on('disconnect', () => {
        const user = activeUsers.find(u => u.socketId === socket.id);
        if (user) user.connected = false;
        pendingRequests = pendingRequests.filter(r => r.socketId !== socket.id);
        refreshAdminLists();
    });
});

server.listen(process.env.PORT || 3000, () => console.log("Server Ready"));