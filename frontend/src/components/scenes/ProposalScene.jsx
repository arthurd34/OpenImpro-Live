import React, { useState } from 'react';
import { t } from '../../utils/i18n';

const ProposalScene = ({ socket, name, gameState, history }) => {
    const { ui } = gameState;
    const [proposal, setProposal] = useState('');

    const params = gameState?.currentScene?.params ?? {};
    const maxProps = params.maxProposals ?? 3;
    const isLimitReached = history.length >= maxProps;

    const handleSend = () => {
        if (!proposal.trim() || isLimitReached) return;
        socket.emit('send_proposal', { userName: name, text: proposal });
        setProposal('');
    };

    return (
        <div className="scene-container">
            <div className="input-group">
                <input
                    value={proposal}
                    onChange={e => setProposal(e.target.value)}
                    placeholder={isLimitReached
                        ? t(ui, 'PROPOSAL_LIMIT_MSG', { max: maxProps })
                        : t(ui, 'PROPOSAL_INPUT_PLACEHOLDER')
                    }
                    disabled={isLimitReached}
                />
                <button
                    className="btn-primary"
                    onClick={handleSend}
                    disabled={!proposal.trim() || isLimitReached}
                >
                    {t(ui, 'PROPOSAL_SEND')}
                </button>
            </div>

            {history.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                    <h4>
                        {maxProps === 1
                            ? t(ui, 'PROPOSAL_TITLE_SINGLE')
                            : t(ui, 'PROPOSAL_TITLE_PLURAL', { count: history.length, max: maxProps })
                        }
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {history.map(h => (
                            <div key={h.id} className="history-item" style={{
                                padding: '8px',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '4px',
                                borderLeft: h.isWinner ? '3px solid gold' : 'none',
                                fontSize: '0.9rem'
                            }}>
                                <span>{h.text}</span>
                                {h.isWinner && <span> {t(ui, 'PROPOSAL_WINNER_ICON')}</span>}
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