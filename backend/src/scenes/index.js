const proposal = require('./proposal');

const sceneHandlers = {
    PROPOSAL: proposal,
};

module.exports = {
    handleEvent: (socket, io, eventName, data, context) => {
        const { currentScene } = context;
        const handler = sceneHandlers[currentScene.type];

        if (handler && handler[eventName]) {
            handler[eventName](socket, io, data, context);
        }
    }
};