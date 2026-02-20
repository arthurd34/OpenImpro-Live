const proposal = require('./proposal');

const sceneHandlers = {
    PROPOSAL: proposal,
};

module.exports = {
    handleEvent: (socket, io, eventName, data, context) => {
        if (!context || !context.currentScene) {
            console.error("Context or CurrentScene is missing in handleEvent");
            return;
        }

        const handler = sceneHandlers[context.currentScene.type];

        if (handler && handler[eventName]) {
            handler[eventName](socket, io, data, context);
        }
    }
};