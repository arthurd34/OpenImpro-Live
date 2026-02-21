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

    // Connection states
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [isReconnecting, setIsReconnecting] = useState(false);

    useEffect(() => {
        // --- AUTH & SYNC ---
        socket.on('login_success', () => setAuth(true));
        socket.on('sync_state', (s) => setState(s));

        // --- LISTS & USERS ---
        socket.on('admin_pending_list', (l) => setRequests(l));
        socket.on('admin_user_list', (l) => setUsers(l));
        socket.on('admin_joins_status', (status) => setAllowJoins(status));

        // --- PROPOSALS (SINGLE SOURCE OF TRUTH) ---
        socket.on('admin_sync_proposals', (list) => setProposals(list));

        // --- CONNECTION MONITORING ---
        const onConnect = () => {
            setIsConnected(true);
            setIsReconnecting(false);
            if (auth && pass) socket.emit('admin_login', pass);
        };
        const onDisconnect = () => setIsConnected(false);
        const onConnectError = () => setIsReconnecting(false);

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('connect_error', onConnectError);

        return () => {
            socket.off();
        };
    }, [auth, pass]);

    const handleManualReconnect = () => {
        setIsReconnecting(true);
        socket.connect();
    };

    const approve = (id) => socket.emit('admin_approve_user', { socketId: id });

    const handleKick = (id, isRefusal = false) => {
        const reason = prompt(isRefusal ? "Motif du refus ?" : "Motif de l'exclusion ?");
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
        <div className="card" style={{maxWidth:'400px', margin:'100px auto', textAlign:'center'}}>
            <h2>Accès Régie</h2>
            <form onSubmit={(e) => { e.preventDefault(); socket.emit('admin_login', pass); }}>
                <input
                    type="password"
                    placeholder="Mot de passe"
                    onChange={e => setPass(e.target.value)}
                    autoFocus
                    style={{width:'100%', marginBottom:'10px'}}
                />
                <button className="btn-primary" style={{width:'100%'}} type="submit">Connexion</button>
            </form>
        </div>
    );

    return (
        <div className="app-container" style={{ position: 'relative' }}>

            {/* ALERT BANNER IF DISCONNECTED */}
            {!isConnected && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
                    background: '#e74c3c', color: 'white', padding: '10px',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px',
                    fontWeight: 'bold', boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                }}>
                    <span>⚠️ CONNEXION PERDUE AVEC LE SERVEUR</span>
                    <button onClick={handleManualReconnect} disabled={isReconnecting} className="btn-primary" style={{background:'white', color:'#e74c3c', padding:'5px 15px'}}>
                        {isReconnecting ? 'Tentative...' : 'Reconnexion'}
                    </button>
                    <button onClick={() => window.location.reload()} style={{background:'transparent', border:'1px solid white', color:'white', padding:'5px 10px', borderRadius:'4px'}}>
                        Rafraîchir
                    </button>
                </div>
            )}

            {/* DASHBOARD CONTENT (Dimmed if disconnected) */}
            <div style={{
                opacity: isConnected ? 1 : 0.5,
                pointerEvents: isConnected ? 'all' : 'none',
                transition: 'opacity 0.3s ease'
            }}>
                <div className="card" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h2>Gestion Live</h2>
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        <div style={{width:12, height:12, borderRadius:'50%', background:'#22c55e'}}></div>
                        <span>Serveur Online</span>
                    </div>
                </div>

                <div className="card">
                    <h3>Scène Actuelle</h3>
                    <div style={{display:'flex', flexWrap:'wrap', gap:'10px'}}>
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

                <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <label className="switch">
                            <input type="checkbox" checked={allowJoins} onChange={toggleInscriptions} />
                            <span className="slider"></span>
                        </label>
                        <div>
                            <h4 style={{ margin: 0 }}>Inscriptions {allowJoins ? 'Ouvertes' : 'Fermées'}</h4>
                            <small style={{ opacity: 0.6 }}>Public peut rejoindre le spectacle</small>
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
                        {requests.length === 0 && <p style={{opacity:0.5, fontStyle:'italic'}}>Aucune demande en attente</p>}
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
                        <h3>Joueurs en ligne ({users.length})</h3>
                        {users.map(u => (
                            <div key={u.socketId} className="user-row">
                                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                    <div style={{
                                        width:'10px', height:'10px', borderRadius:'50%',
                                        background: u.connected ? '#22c55e' : '#ef4444'
                                    }}></div>
                                    <span>{u.name}</span>
                                </div>
                                <div>
                                    <button onClick={() => {
                                        const newName = prompt("Nouveau nom ?", u.name);
                                        if(newName) socket.emit('admin_rename_user', {socketId: u.socketId, newName});
                                    }}>Editer</button>
                                    <button className="btn-danger" onClick={() => handleKick(u.socketId, false)}>Kick</button>
                                </div>
                            </div>
                        ))}
                    </section>
                </div>

                {state?.currentScene.type === 'PROPOSAL' && (
                    <section className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3>Réponses Public</h3>
                            <button className="btn-danger" onClick={() => {
                                if(window.confirm("Tout effacer ?")) socket.emit('admin_clear_all_proposals');
                            }}>
                                VIDER LA LISTE
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {proposals.length === 0 && <p style={{textAlign:'center', opacity:0.5}}>En attente de propositions...</p>}
                            {proposals.map(ans => (
                                <div key={ans.id} className="user-row" style={{
                                    borderLeft: ans.isWinner ? '5px solid #f1c40f' : '5px solid transparent',
                                    paddingLeft: '15px'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <small style={{ opacity: 0.5 }}>{ans.timestamp}</small>
                                        <div style={{fontSize:'1.1rem'}}>
                                            <strong style={{ color: '#3498db' }}>{ans.userName}</strong> : {ans.text}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        {!ans.isWinner && <button onClick={() => socket.emit('admin_approve_proposal', ans)}>🏆 Gagnant</button>}
                                        <button className="btn-danger" onClick={() => socket.emit('admin_delete_proposal', ans.id)}>X</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default AdminView;