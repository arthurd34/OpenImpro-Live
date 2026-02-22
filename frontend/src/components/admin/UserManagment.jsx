import React from 'react';
import { t } from '../../utils/i18n';

const UserManagement = ({ ui, requests, users, allowJoins, toggleInscriptions, approve, handleKick, rename }) => {
    return (
        <>
            <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <label className="switch">
                        <input type="checkbox" checked={allowJoins} onChange={toggleInscriptions} />
                        <span className="slider"></span>
                    </label>
                    <div>
                        <h4 style={{ margin: 0 }}>
                            {t(ui, 'INSCRIPTIONS')} {allowJoins ? t(ui, 'OPEN') : t(ui, 'CLOSED')}
                        </h4>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{users.length}</span>
                    <small style={{ display: 'block', opacity: 0.5 }}>{t(ui, 'PLAYERS_UPPER')}</small>
                </div>
            </div>

            <div className="admin-grid">
                <section className="card">
                    <h3>{t(ui, 'REQUESTS')} ({requests.length})</h3>
                    {requests.map(r => (
                        <div key={r.socketId} className="user-row">
                            <strong>{r.name}</strong>
                            <div>
                                <button className="btn-primary" onClick={() => approve(r.socketId)}>
                                    {t(ui, 'ACCEPT')}
                                </button>
                                <button className="btn-danger" onClick={() => handleKick(r.socketId, true)}>
                                    {t(ui, 'REJECT')}
                                </button>
                            </div>
                        </div>
                    ))}
                    {requests.length === 0 && <p style={{ opacity: 0.3, textAlign: 'center' }}>{t(ui, 'NO_REQUESTS')}</p>}
                </section>

                <section className="card">
                    <h3>{t(ui, 'PLAYERS')} ({users.length})</h3>
                    {users.map(u => (
                        <div key={u.socketId} className="user-row">
                            <span>{u.name}</span>
                            <div>
                                <button onClick={() => rename(u)}>
                                    {t(ui, 'EDIT')}
                                </button>
                                <button className="btn-danger" onClick={() => handleKick(u.socketId, false)}>
                                    {t(ui, 'KICK')}
                                </button>
                            </div>
                        </div>
                    ))}
                    {users.length === 0 && <p style={{ opacity: 0.3, textAlign: 'center' }}>{t(ui, 'NO_PLAYERS')}</p>}
                </section>
            </div>
        </>
    );
};

export default UserManagement;