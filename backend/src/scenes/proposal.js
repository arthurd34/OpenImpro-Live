module.exports = {
    send_proposal: (socket, io, data, context) => {
        const { activeUsers, allProposals } = context;
        const user = activeUsers.find(u => u.name === data.userName);

        if (!user || user.proposals.length >= 5) return;

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
    },

    admin_approve_proposal: (socket, io, ans, context) => {
        const { allProposals, activeUsers } = context;
        const winner = allProposals.find(a => a.id === ans.id);
        if (winner) winner.isWinner = true;

        const user = activeUsers.find(u => u.name === ans.userName);
        if (user) {
            const userAns = user.proposals.find(a => a.id === ans.id);
            if (userAns) userAns.isWinner = true;
            io.to(user.socketId).emit('user_history_update', user.proposals);
        }

        io.emit('show_on_screen', winner || ans);
        io.to('admin_room').emit('admin_sync_proposals', allProposals);
    }
};