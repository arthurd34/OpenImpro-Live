import React from 'react';
import { t } from '../../utils/i18n';

const ProposalAdmin = ({ ui, proposals, socket }) => {
    const handleClearAll = () => {
        if (window.confirm(t(ui, 'CONFIRM_CLEAR_PROPOSALS'))) {
            socket.emit('admin_clear_all_proposals');
        }
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
                        borderLeft: ans.isWinner ? '5px solid var(--primary)' : '5px solid rgba(255,255,255,0.1)',
                        paddingLeft: '15px',
                        background: ans.isWinner ? 'rgba(0, 212, 255, 0.05)' : 'rgba(255,255,255,0.02)'
                    }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <strong style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>{ans.userName}</strong>
                                <small style={{ opacity: 0.4, fontSize: '0.7rem' }}>{ans.timestamp}</small>
                            </div>
                            <div style={{ fontSize: '1.05rem', lineHeight: '1.4' }}>
                                {ans.text}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {!ans.isWinner && (
                                <button onClick={() => socket.emit('admin_approve_proposal', ans)} style={{ padding: '6px 12px' }}>
                                    {t(ui, 'SET_WINNER')}
                                </button>
                            )}
                            <button
                                className="btn-danger"
                                onClick={() => socket.emit('admin_delete_proposal', ans.id)}
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