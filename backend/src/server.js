require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let currentActIndex = 0;
let activeUsers = [];
let pendingRequests = [];
let allAnswers = [];

const showConfig = {
    acts: [
        { id: 'WAITING', title: "Logo / Waiting", type: "WAITING" },
        { id: 'ANSWER', title: "Crazy Blind Test", type: "ANSWER" }
    ]
};

// --- HELPERS ---
function getSyncData() {
    return { currentAct: showConfig.acts[currentActIndex], currentIndex: currentActIndex, playlist: showConfig.acts };
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
            sendSync(socket);
            socket.emit('admin_user_list', activeUsers);
            socket.emit('admin_pending_list', pendingRequests);
            socket.emit('admin_sync_answers', allAnswers);
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
                socket.emit('user_history_update', existingUser.answers || []);
                refreshAdminLists();
            } else {
                socket.emit('status_update', { status: 'session_expired', reason: "Session expirée." });
            }
        } else {
            const nameExists = existingUser || pendingRequests.find(u => u.name.toLowerCase() === nameLower);
            if (nameExists) {
                return socket.emit('status_update', { status: 'rejected', reason: `Le nom "${data.name}" est déjà pris.` });
            }
            const req = { socketId: socket.id, name: data.name, connected: true, answers: [] };
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

    socket.on('send_answer', (data) => {
        const user = activeUsers.find(u => u.name === data.userName);
        if (!user) return;

        if (user.answers.length >= 5) {
            return socket.emit('status_update', { status: 'approved', message: "Limite de 5 réponses atteinte !" });
        }

        const newAnswer = {
            id: Date.now(),
            userName: data.userName,
            text: data.text,
            timestamp: new Date().toLocaleTimeString('fr-FR', { hour12: false }),
            isWinner: false
        };

        user.answers.push(newAnswer);
        allAnswers.push(newAnswer);

        io.to('admin_room').emit('admin_new_answer', newAnswer);
        socket.emit('user_history_update', user.answers);
    });

    // --- UNIQUE APPROVE LOGIC (CORRIGÉ) ---
    socket.on('admin_approve_answer', (ans) => {
        // 1. Marquer comme gagnant dans la liste globale
        const winnerGlobal = allAnswers.find(a => a.id === ans.id);
        if (winnerGlobal) winnerGlobal.isWinner = true;

        // 2. Marquer comme gagnant dans l'historique de l'utilisateur pour le trophée 🏆
        const user = activeUsers.find(u => u.name === ans.userName);
        if (user && user.answers) {
            const winnerLocal = user.answers.find(a => a.id === ans.id);
            if (winnerLocal) winnerLocal.isWinner = true;
            // Envoyer la mise à jour de l'historique au téléphone du gagnant
            io.to(user.socketId).emit('user_history_update', user.answers);
        }

        // 3. Afficher sur l'écran géant et mettre à jour la vue Admin
        io.emit('show_on_screen', winnerGlobal || ans);
        io.to('admin_room').emit('admin_sync_answers', allAnswers);
    });

    socket.on('admin_delete_answer', (answerId) => {
        allAnswers = allAnswers.filter(a => a.id !== answerId);
        activeUsers.forEach(u => {
            if(u.answers) {
                u.answers = u.answers.filter(a => a.id !== answerId);
                io.to(u.socketId).emit('user_history_update', u.answers);
            }
        });
        io.to('admin_room').emit('admin_sync_answers', allAnswers);
    });

    socket.on('admin_clear_all_answers', () => {
        allAnswers = [];
        activeUsers.forEach(u => {
            u.answers = [];
            io.to(u.socketId).emit('user_history_update', []);
        });
        io.to('admin_room').emit('admin_sync_answers', []);
    });

    socket.on('admin_kick_user', ({ socketId, reason, isRefusal }) => {
        const user = activeUsers.find(u => u.socketId === socketId);
        if (user) {
            allAnswers = allAnswers.filter(a => a.userName !== user.name);
            io.to('admin_room').emit('admin_sync_answers', allAnswers);
        }
        io.to(socketId).emit('status_update', { status: isRefusal ? 'rejected' : 'kicked', reason: reason || "Action Admin" });
        activeUsers = activeUsers.filter(u => u.socketId !== socketId);
        pendingRequests = pendingRequests.filter(u => u.socketId !== socketId);
        refreshAdminLists();
        setTimeout(() => {
            const target = io.sockets.sockets.get(socketId);
            if (target) target.disconnect();
        }, 500);
    });

    socket.on('admin_set_act', (index) => {
        currentActIndex = index;
        io.emit('sync_state', getSyncData());
    });

    socket.on('disconnect', () => {
        const user = activeUsers.find(u => u.socketId === socket.id);
        if (user) user.connected = false;
        pendingRequests = pendingRequests.filter(r => r.socketId !== socket.id);
        refreshAdminLists();
    });
});

server.listen(process.env.PORT || 3000, () => console.log("🚀 Server Beta Ready"));