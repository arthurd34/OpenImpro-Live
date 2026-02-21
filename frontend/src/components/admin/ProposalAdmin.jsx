import React from 'react';

const ProposalAdmin = ({ proposals, socket }) => {
    const handleClearAll = () => {
        if (window.confirm("Voulez-vous vraiment vider toutes les propositions ?")) {
            socket.emit('admin_clear_all_proposals');
        }
    };

    return (
        <section className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3>Réponses Public</h3>
                <button className="btn-danger" onClick={handleClearAll}>
                    VIDER LA LISTE
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {proposals.length === 0 && (
                    <p style={{ textAlign: 'center', opacity: 0.5 }}>En attente de propositions...</p>
                )}

                {proposals.map(ans => (
                    <div key={ans.id} className="user-row" style={{
                        borderLeft: ans.isWinner ? '5px solid #f1c40f' : '5px solid transparent',
                        paddingLeft: '15px'
                    }}>
                        <div style={{ flex: 1 }}>
                            <small style={{ opacity: 0.5 }}>{ans.timestamp}</small>
                            <div style={{ fontSize: '1.1rem' }}>
                                <strong style={{ color: '#3498db' }}>{ans.userName}</strong> : {ans.text}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            {!ans.isWinner && (
                                <button onClick={() => socket.emit('admin_approve_proposal', ans)}>
                                    🏆 Gagnant
                                </button>
                            )}
                            <button className="btn-danger" onClick={() => socket.emit('admin_delete_proposal', ans.id)}>
                                X
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ProposalAdmin;