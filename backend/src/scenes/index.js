const proposal = require('./proposal');

// Registry of available scene types and their respective handlers
const sceneHandlers = {
    PROPOSAL: proposal,
    // Add other scene types here (e.g., VOTING: votingHandler)
};

module.exports = {
    /**
     * Routes incoming socket events to the current scene's handler
     */
    handleEvent: (socket, io, eventName, data, context) => {
        if (!context || !context.currentScene) return;

        const handler = sceneHandlers[context.currentScene.type];

        if (handler && typeof handler[eventName] === 'function') {
            handler[eventName](socket, io, data, context);
        }
    },

    /**
     * Global cleanup hook called when a user is kicked or removed
     * Iterates through all scene modules to clear relevant user data
     */
    cleanupUser: (io, user, context) => {
        Object.values(sceneHandlers).forEach(handler => {
            if (typeof handler.cleanupUser === 'function') {
                handler.cleanupUser(io, user, context);
            }
        });
    }
};