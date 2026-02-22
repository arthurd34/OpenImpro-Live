import React from 'react';
import { t } from '../../utils/i18n';
const ProposalAdmin = ({ ui, proposals, socket, token }) => {

    const handleClearAll = () => {
        if (window.confirm(t(ui, 'CONFIRM_CLEAR_PROPOSALS'))) {
            socket.emit('admin_clear_all_proposals', { token });
        }
    };

    const handleToggleDisplay = (proposal) => {
        socket.emit('admin_display_proposal', {
            token, // Indispensable pour adminAction sur le serveur
            id: proposal.id,
            value: !proposal.isDisplayed
        });
    };

    const handleToggleWinner = (proposal) => {
        socket.emit('admin_set_winner', {
            token, // Indispensable pour adminAction sur le serveur
            id: proposal.id,
            value: !proposal.isWinner
        });
    };

    return (
        <section className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ margin: 0 }}>{t(ui, 'PUBLIC_RESPONSES')}</h3>
                <button className="btn-danger" onClick={handleClearAll} style={{ fontSize: '0.8rem' }}>
                    {t(ui, 'CLEAR_LIST')}
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {proposals.length === 0 && (
                    <p style={{ textAlign: 'center', opacity: 0.5, padding: '20px' }}>
                        {t(ui, 'WAITING_FOR_PROPOSALS')}
                    </p>
                )}

                {proposals.map(ans => (
                    <div key={ans.id} className="user-row" style={{
                        borderLeft: ans.isWinner ? '5px solid #f59e0b' : '5px solid rgba(255,255,255,0.1)',
                        paddingLeft: '15px',
                        background: ans.isWinner ? 'rgba(245, 158, 11, 0.05)' : 'rgba(255,255,255,0.02)',
                        transition: 'all 0.3s ease',
                        // Mise en évidence bleue si diffusé
                        outline: ans.isDisplayed ? '2px solid #00d4ff' : 'none',
                        outlineOffset: '-2px'
                    }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <strong style={{ color: ans.isWinner ? '#f59e0b' : '#00d4ff', fontSize: '0.9rem' }}>
                                    {ans.userName} {ans.isWinner && '🏆'}
                                </strong>
                                <small style={{ opacity: 0.4, fontSize: '0.7rem' }}>{ans.timestamp}</small>
                            </div>
                            <div style={{ fontSize: '1.05rem', lineHeight: '1.4', fontWeight: ans.isDisplayed ? 'bold' : 'normal' }}>
                                {ans.text}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>

                            {/* BOUTON DIFFUSION */}
                            <button
                                onClick={() => handleToggleDisplay(ans)}
                                className={ans.isDisplayed ? "btn-primary" : ""}
                                style={{
                                    padding: '6px 12px',
                                    fontSize: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    backgroundColor: ans.isDisplayed ? '#00d4ff' : ''
                                }}
                            >
                                {ans.isDisplayed ? '📺 DIFFUSÉ' : '📺 DIFFUSER'}
                            </button>

                            {/* BOUTON GAGNANT (Toggle) */}
                            <button
                                onClick={() => handleToggleWinner(ans)}
                                style={{
                                    padding: '6px 12px',
                                    fontSize: '0.75rem',
                                    border: ans.isWinner ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.2)',
                                    background: ans.isWinner ? 'transparent' : '',
                                    color: ans.isWinner ? '#f59e0b' : 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                {ans.isWinner ? '❌ DÉMARQUER' : '🏆 GAGNANT'}
                            </button>

                            {/* BOUTON SUPPRIMER */}
                            <button
                                className="btn-danger"
                                onClick={() => socket.emit('admin_delete_proposal', { token, id: ans.id })}
                                style={{ padding: '6px 10px', minWidth: '35px' }}
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ProposalAdmin;