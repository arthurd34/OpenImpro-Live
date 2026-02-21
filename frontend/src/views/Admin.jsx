import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import SceneControl from '../components/admin/SceneControl';

const socket = io(`http://${window.location.hostname}:3000`);

const AdminView = () => {
    const [auth, setAuth] = useState(false);
    const [pass, setPass] = useState('');
    const [state, setState] = useState(null);
    const [requests, setRequests] = useState([]);
    const [users, setUsers] = useState([]);
    const [proposals, setProposals] = useState([]);
    const [allowJoins, setAllowJoins] = useState(true);
    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        // --- Authentication & Global Sync ---
        socket.on('login_success', () => setAuth(true));
        socket.on('sync_state', (s) => setState(s));

        // --- User & Request Management ---
        // Received when admin logs in or a bulk update happens
        socket.on('admin_pending_list', (list) => setRequests(list));
        socket.on('admin_user_list', (list) => setUsers(list));

        // CRITICAL: Received when a new user hits the "Join" button
        socket.on('admin_new_request', (newReq) => {
            setRequests(prev => [...prev, newReq]);
        });

        // --- Settings & Proposals ---
        socket.on('admin_joins_status', (status) => setAllowJoins(status));
        socket.on('admin_sync_proposals', (list) => setProposals(list));

        // --- Connection Monitoring ---
        const onConnect = () => {
            setIsConnected(true);
            if (auth && pass) socket.emit('admin_login', pass);
        };
        const onDisconnect = () => setIsConnected(false);

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        // Cleanup all listeners on unmount to prevent memory leaks and duplicates
        return () => {
            socket.off('login_success');
            socket.off('sync_state');
            socket.off('admin_pending_list');
            socket.off('admin_user_list');
            socket.off('admin_new_request');
            socket.off('admin_joins_status');
            socket.off('admin_sync_proposals');
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
        };
    }, [auth, pass]);

    const handleKick = (id, isRefusal = false) => {
        const reason = prompt(isRefusal ? "Motif du refus ?" : "Motif de l'exclusion ?");
        if (reason !== null) socket.emit('admin_kick_user', { socketId: id, reason, isRefusal });
    };

    if (!auth) return (
        <div className="card" style={{maxWidth:'400px', margin:'100px auto', textAlign:'center'}}>
            <h2>Accès Régie</h2>
            <form onSubmit={(e) => { e.preventDefault(); socket.emit('admin_login', pass); }}>
                <input type="password" placeholder="Mot de passe" onChange={e => setPass(e.target.value)} autoFocus style={{width:'100%', marginBottom:'10px'}} />
                <button className="btn-primary" style={{width:'100%'}} type="submit">Connexion</button>
            </form>
        </div>
    );

    return (
        <div className="app-container">
            {/* CONNECTION STATUS BANNER */}
            {!isConnected && (
                <div className="connexion-error-banner">
                    ⚠️ CONNEXION PERDUE
                    <button onClick={() => socket.connect()} className="btn-primary">Reconnecter</button>
                </div>
            )}

            <div style={{ opacity: isConnected ? 1 : 0.5, pointerEvents: isConnected ? 'all' : 'none' }}>

                {/* 1. SCENE NAVIGATION */}
                <div className="card">
                    <h3>Scène Actuelle</h3>
                    <div style={{display:'flex', flexWrap:'wrap', gap:'10px'}}>
                        {state?.playlist.map((act, i) => (
                            <button key={act.id} className={state.currentIndex === i ? "btn-primary" : ""} onClick={() => socket.emit('admin_set_scene', i)}>
                                {act.title}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. USER MANAGEMENT */}
                <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <label className="switch">
                            <input type="checkbox" checked={allowJoins} onChange={() => socket.emit('admin_toggle_joins', !allowJoins)} />
                            <span className="slider"></span>
                        </label>
                        <h4 style={{ margin: 0 }}>Inscriptions {allowJoins ? 'Ouvertes' : 'Fermées'}</h4>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{users.length}</span>
                        <small style={{ display: 'block', opacity: 0.5 }}>JOUEURS</small>
                    </div>
                </div>

                {/* 3. EN -> USER GRID */}
                <div className="admin-grid">
                    <section className="card">
                        <h3>Demandes ({requests.length})</h3>
                        {requests.map(r => (
                            <div key={r.socketId} className="user-row">
                                <strong>{r.name}</strong>
                                <div>
                                    <button onClick={() => socket.emit('admin_approve_user', { socketId: r.socketId })}>Accepter</button>
                                    <button className="btn-danger" onClick={() => handleKick(r.socketId, true)}>X</button>
                                </div>
                            </div>
                        ))}
                    </section>

                    <section className="card">
                        <h3>Joueurs ({users.length})</h3>
                        {users.map(u => (
                            <div key={u.socketId} className="user-row">
                                <span style={{color: u.connected ? '#22c55e' : '#ef4444'}}>● {u.name}</span>
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

                {/* 4. DYNAMIC SCENE CONTROLS */}
                <SceneControl
                    currentScene={state?.currentScene}
                    proposals={proposals}
                    socket={socket}
                />
            </div>
        </div>
    );
};

export default AdminView;