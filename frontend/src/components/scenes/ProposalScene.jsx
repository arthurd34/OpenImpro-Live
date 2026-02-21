import React, { useState } from 'react';

const ProposalScene = ({ socket, name, gameState, history }) => {
    const [proposal, setProposal] = useState('');
    const params = gameState?.currentScene?.params ?? {};
    const maxProps = params.maxProposals ?? 3;

    const handleSend = () => {
        if (!proposal.trim() || history.length >= maxProps) return;
        socket.emit('send_proposal', { userName: name, text: proposal });
        setProposal('');
    };

    return (
        <div className="scene-container">
            <div className="input-group">
                <input
                    value={proposal}
                    onChange={e => setProposal(e.target.value)}
                    placeholder={history.length >= maxProps ? "Limite d'envois atteinte" : params.theme}
                    disabled={history.length >= maxProps}
                />
                <button
                    className="btn-primary"
                    onClick={handleSend}
                    disabled={!proposal.trim() || history.length >= maxProps}
                >
                    Envoyer
                </button>
            </div>

            {history.length > 0 && (
            <div style={{ marginTop: '20px' }}>
                <h4>
                    {maxProps === 1
                        ? "Ma proposition"
                        : `Mes propositions : ${history.length} / ${maxProps}`
                    }
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {
                        history.map(h => (
                            <div key={h.id} className="history-item" style={{
                                padding: '8px',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '4px',
                                borderLeft: h.isWinner ? '3px solid gold' : 'none',
                                fontSize: '0.9rem'
                            }}>
                                <span>{h.text}</span> {h.isWinner && "🏆"}
                                <small style={{ float: 'right', opacity: 0.5 }}>{h.timestamp}</small>
                            </div>
                    ))}
                </div>
            </div>
            )}
        </div>
    );
};

export default ProposalScene;