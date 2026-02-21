import React from 'react';
import ProposalAdmin from './ProposalAdmin';

const SceneControl = ({ currentScene, proposals, socket }) => {
    if (!currentScene) return null;

    switch (currentScene.type) {
        case 'PROPOSAL':
            return <ProposalAdmin proposals={proposals} socket={socket} />;

        // C'est ici que tu ajouteras tes futurs modes :
        // case 'QUIZ': return <QuizAdmin ... />;

        default:
            return (
                <div className="card" style={{ textAlign: 'center', opacity: 0.5 }}>
                    La scène actuelle (<strong>{currentScene.type}</strong>) n'a pas de contrôles spécifiques.
                </div>
            );
    }
};

export default SceneControl;