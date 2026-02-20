import React from 'react';

const WaitingScene = ({ gameState }) => {
    const params = gameState?.currentScene?.params ?? {};
    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <h2>{params.titleDisplay || "Attente du prochain jeu..."}</h2>
            <p style={{ opacity: 0.7 }}>Regardez l'écran de scène !</p>
        </div>
    );
};

export default WaitingScene;