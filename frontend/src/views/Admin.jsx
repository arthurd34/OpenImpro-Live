import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io(`http://${window.location.hostname}:3000`);

const AdminView = () => {
    const [auth, setAuth] = useState(false);
    const [pass, setPass] = useState('');
    const [state, setState] = useState(null);
    const [requests, setRequests] = useState([]);
    const [users, setUsers] = useState([]);
    const [proposals, setProposals] = useState([]);
    const [allowJoins, setAllowJoins] = useState(true);

    useEffect(() => {
        socket.on('login_success', () => setAuth(true));
        socket.on('sync_state', (s) => {
            setState(s);
            setProposals([]);
        });
        socket.on('admin_pending_list', (l) => setRequests(l));
        socket.on('admin_user_list', (l) => setUsers(l));
        socket.on('admin_new_request', (r) => setRequests(prev => [...prev, r]));
        socket.on('admin_new_proposal', (a) => setProposals(prev => [a, ...prev]));
        socket.on('admin_sync_proposals', (list) => setProposals(list));
        socket.on('admin_new_proposal', (ans) => setProposals(prev => [ans, ...prev]));
        socket.on('admin_joins_status', (status) => setAllowJoins(status));
        return () => socket.off();
    }, []);

    const approve = (id) => socket.emit('admin_approve_user', { socketId: id });

    // --- RE-INSTATED KICK LOGIC WITH POPUP ---
    const handleKick = (id, isRefusal = false) => {
        const reason = prompt(isRefusal ? "Reason for refusal? (Optional)" : "Reason for kick? (Optional)");
        // If user clicks "Cancel" (null), we stop. If empty string, it sends default message.
        if (reason !== null) {
            socket.emit('admin_kick_user', {
                socketId: id,
                reason: reason,
                isRefusal: isRefusal
            });
        }
    };

    const toggleInscriptions = () => {
        socket.emit('admin_toggle_joins', !allowJoins);
    };

    if (!auth) return (
        <div className="card" style={{maxWidth:'400px', margin:'50px auto'}}>
            <form onSubmit={(e) => { e.preventDefault(); socket.emit('admin_login', pass); }}>
                <input type="password" placeholder="Mot de passe Admin" onChange={e => setPass(e.target.value)} />
                <button className="btn-primary" type="submit">Connexion</button>
            </form>
        </div>
    );

    return (
        <div className="app-container">
            <div className="card" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h2>Panneau d'administration</h2>
            </div>

            <div className="card">
                <h3>Sélection de la Scène</h3>
                <div style={{display:'flex', gap:'10px'}}>
                    {state?.playlist.map((act, i) => (
                        <button
                            key={act.id}
                            className={state.currentIndex === i ? "btn-primary" : ""}
                            onClick={() => socket.emit('admin_set_scene', i)}
                        >
                            {act.title}
                        </button>
                    ))}
                </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <label className="switch">
                        <input type="checkbox" checked={allowJoins} onChange={toggleInscriptions} />
                        <span className="slider"></span>
                    </label>
                    <div>
                        <h4 style={{ margin: 0 }}>Inscriptions {allowJoins ? 'Ouvertes' : 'Fermées'}</h4>
                        <small style={{ opacity: 0.6 }}>
                            {allowJoins ? 'Le public peut envoyer des demandes' : 'Les nouveaux joueurs sont bloqués'}
                        </small>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{users.length}</span>
                    <small style={{ display: 'block', opacity: 0.5 }}>JOUEURS</small>
                </div>
            </div>

            <div className="admin-grid">
                <section className="card">
                    <h3>En attente ({requests.length})</h3>
                    {requests.map(r => (
                        <div key={r.socketId} className="user-row">
                            <span>{r.name}</span>
                            <div>
                                <button onClick={() => approve(r.socketId)}>Accepter</button>
                                <button className="btn-danger" onClick={() => handleKick(r.socketId, true)}>Refuser</button>
                            </div>
                        </div>
                    ))}
                </section>

                <section className="card">
                    <h3>En jeu ({users.length})</h3>
                    {users.map(u => (
                        <div key={u.socketId} className="user-row">
                            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                <div style={{
                                    width:'10px', height:'10px', borderRadius:'50%',
                                    background: u.connected ? '#22c55e':'#64748b'
                                }}></div>
                                <span>{u.name}</span>
                            </div>
                            <div>
                                <button onClick={() => {
                                    const newName = prompt("Nouveau nom ?", u.name);
                                    if(newName) socket.emit('admin_rename_user', {socketId: u.socketId, newName});
                                }}>Renommer</button>
                                <button className="btn-danger" onClick={() => handleKick(u.socketId, false)}>Exclure</button>
                            </div>
                        </div>
                    ))}
                </section>
            </div>

            {state?.currentScene.type === 'PROPOSAL' && (
                <section className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                        <h3>Réponses en direct</h3>
                        <button className="btn-danger" onClick={() => socket.emit('admin_clear_all_proposals')}>
                            TOUT EFFACER
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {proposals.map(ans => (
                            <div key={ans.id} className="user-row" style={{ borderLeft: ans.isWinner ? '4px solid gold' : 'none' }}>
                                <div style={{ flex: 1 }}>
                                    <small style={{ opacity: 0.5 }}>[{ans.timestamp}]</small>
                                    <strong style={{ color: 'var(--primary)', marginLeft: '10px' }}>{ans.userName} :</strong> {ans.text}
                                </div>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <button onClick={() => socket.emit('admin_approve_proposal', ans)}>Gagnant</button>
                                    <button className="btn-danger" onClick={() => socket.emit('admin_delete_proposal', ans.id)}>X</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default AdminView;