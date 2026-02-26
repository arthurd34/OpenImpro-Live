import React from 'react';
import ProposalAdmin from './ProposalAdmin';
import { t } from '../../utils/i18n';

const SceneControl = ({ currentScene, proposals, socket, token, emitAdmin, ui, isLive }) => {
    if (!currentScene) return null;

    // --- DYNAMIC STYLE ---
    const liveStatusStyle = {
        transition: 'all 0.3s ease',
        borderTop: `4px solid ${isLive ? '#22c55e' : '#ef4444'}`,
        backgroundColor: isLive ? 'rgba(34, 197, 94, 0.02)' : 'rgba(239, 68, 68, 0.05)',
        borderRadius: '12px',
        marginTop: '20px'
    };

    const renderContent = () => {
        switch (currentScene.type) {
            case 'PROPOSAL':
                return (
                    <ProposalAdmin
                        proposals={proposals}
                        socket={socket}
                        token={token}
                        emitAdmin={emitAdmin}
                        ui={ui}
                        currentScene={currentScene}
                    />
                );

            default:
                if (!isLive) {
                    return (
                        <div className="card" style={{ textAlign: 'center', border: 'none', background: 'transparent' }}>
                            {t(ui, 'ADMIN_NO_SELECTED_SCENE')}
                        </div>
                    );
                } else {
                    return (
                        <div className="card"
                             style={{textAlign: 'center', opacity: 0.5, border: 'none', background: 'transparent'}}>
                            {t(ui, 'ADMIN_NO_CONTROLS_FOR_SCENE', {name: currentScene.title ?? currentScene.type})}
                        </div>
                    );
                }
        }
    };

    return (
        <div style={liveStatusStyle}>
            {renderContent()}
        </div>
    );
};

export default SceneControl;