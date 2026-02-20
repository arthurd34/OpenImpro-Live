module.exports = {
    approveUser: (socket, io, data, context) => {
        const { socketId, welcomeMessage } = data;
        const { pendingRequests, activeUsers, refreshAdminLists, getSyncData } = context;

        const userReq = pendingRequests.find(r => r.socketId === socketId);
        if (userReq) {
            //move to activeUsers
            const index = pendingRequests.indexOf(userReq);
            pendingRequests.splice(index, 1);
            activeUsers.push(userReq);

            io.to(socketId).emit('status_update', {
                status: 'approved',
                message: welcomeMessage
            });
            io.to(socketId).emit('sync_state', getSyncData());
            refreshAdminLists();
        }
    },

    kickUser: (socket, io, data, context) => {
        const { socketId, reason, isRefusal } = data;
        const {
            activeUsers,
            pendingRequests,
            allProposals,
            refreshAdminLists,
            setActiveUsers,
            setPendingRequests,
            setAllProposals
        } = context;

        const user = activeUsers.find(u => u.socketId === socketId);

        // 1. Nettoyage des propositions si l'utilisateur existe
        if (user) {
            const filteredProposals = allProposals.filter(a => a.userName !== user.name);
            setAllProposals(filteredProposals);
            io.to('admin_room').emit('admin_sync_proposals', filteredProposals);
        }

        // 2. Notification au client
        io.to(socketId).emit('status_update', {
            status: isRefusal ? 'rejected' : 'kicked',
            reason: reason ? "Un administrateur a mis fin à votre session pour la raison suivante : " + reason : "Un administrateur a mis fin à votre session."
        });

        // 3. Mise à jour des listes globales via les setters
        const newActiveList = activeUsers.filter(u => u.socketId !== socketId);
        const newPendingList = pendingRequests.filter(u => u.socketId !== socketId);

        setActiveUsers(newActiveList);
        setPendingRequests(newPendingList);


        // On le rappelle après les setters
        refreshAdminLists();

        // 5. Déconnexion
        setTimeout(() => {
            const target = io.sockets.sockets.get(socketId);
            if (target) target.disconnect();
        }, 500);
    },

    renameUser: (socket, io, data, context) => {
        const { socketId, newName } = data;
        const { activeUsers, refreshAdminLists } = context;

        const user = activeUsers.find(u => u.socketId === socketId);
        if (user) {
            user.name = newName;
            io.to(socketId).emit('name_updated', newName);
            refreshAdminLists();
        }
    }
};