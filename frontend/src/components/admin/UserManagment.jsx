import React from 'react';

const UserManagement = ({ requests, users, allowJoins, toggleInscriptions, approve, handleKick, rename }) => {
    return (
        <>
            <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <label className="switch">
                        <input type="checkbox" checked={allowJoins} onChange={toggleInscriptions} />
                        <span className="slider"></span>
                    </label>
                    <div>
                        <h4 style={{ margin: 0 }}>Inscriptions {allowJoins ? 'Ouvertes' : 'Fermées'}</h4>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{users.length}</span>
                    <small style={{ display: 'block', opacity: 0.5 }}>JOUEURS</small>
                </div>
            </div>

            <div className="admin-grid">
                <section className="card">
                    <h3>Demandes ({requests.length})</h3>
                    {requests.map(r => (
                        <div key={r.socketId} className="user-row">
                            <strong>{r.name}</strong>
                            <div>
                                <button onClick={() => approve(r.socketId)}>Accepter</button>
                                <button className="btn-danger" onClick={() => handleKick(r.socketId, true)}>Refuser</button>
                            </div>
                        </div>
                    ))}
                </section>

                <section className="card">
                    <h3>Joueurs ({users.length})</h3>
                    {users.map(u => (
                        <div key={u.socketId} className="user-row">
                            <span>{u.name}</span>
                            <div>
                                <button onClick={() => rename(u)}>Editer</button>
                                <button className="btn-danger" onClick={() => handleKick(u.socketId, false)}>Kick</button>
                            </div>
                        </div>
                    ))}
                </section>
            </div>
        </>
    );
};

export default UserManagement;