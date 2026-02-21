import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import SceneControl from '../components/admin/SceneControl';
import { t } from '../utils/i18n';

const socket = io(`http://${window.location.hostname}:3000`);

const AdminView = () => {
    const [auth, setAuth] = useState(false);
    const [pass, setPass] = useState('');
    // On récupère le token du localStorage dès le début
    const [token, setToken] = useState(localStorage.getItem('admin_token'));
    const [rememberMe, setRememberMe] = useState(!!localStorage.getItem('admin_token'));

    const [state, setState] = useState(null);
    const [requests, setRequests] = useState([]);
    const [users, setUsers] = useState([]);
    const [proposals, setProposals] = useState([]);
    const [allowJoins, setAllowJoins] = useState(true);
    const [isConnected, setIsConnected] = useState(socket.connected);

    const ui = state?.ui || {};

    // --- HELPER SÉCURISÉ ---
    // Cette fonction injecte automatiquement le token dans chaque envoi
    const emitAdmin = useCallback((event, data = {}) => {
        socket.emit(event, { ...data, token });
    }, [token]);

    useEffect(() => {
        // --- AUTH LOGIC ---
        socket.on('login_success', (data) => {
            setAuth(true);
            setToken(data.token);
            if (localStorage.getItem('admin_remember') === 'true') {
                localStorage.setItem('admin_token', data.token);
            }
        });

        socket.on('login_error', (msg) => {
            alert(msg);
            handleLogout();
        });

        // Tentative de reconnexion auto si token présent
        if (token && !auth) {
            socket.emit('admin_login', { token });
        }

        // --- SYNC EVENTS ---
        socket.on('sync_state', (s) => setState(s));
        socket.on('admin_pending_list', (list) => setRequests(list));
        socket.on('admin_user_list', (list) => setUsers(list));
        socket.on('admin_new_request', (newReq) => setRequests(prev => [...prev, newReq]));
        socket.on('admin_joins_status', (status) => setAllowJoins(status));
        socket.on('admin_sync_proposals', (list) => setProposals(list));

        const onConnect = () => {
            setIsConnected(true);
            const saved = localStorage.getItem('admin_token');
            if (saved) socket.emit('admin_login', { token: saved });
        };
        const onDisconnect = () => setIsConnected(false);

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        return () => {
            socket.off('login_success');
            socket.off('login_error');
            socket.off('sync_state');
            socket.off('admin_pending_list');
            socket.off('admin_user_list');
            socket.off('admin_new_request');
            socket.off('admin_joins_status');
            socket.off('admin_sync_proposals');
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
        };
    }, [auth, token]);

    // --- HANDLERS ---
    const handleLogin = (e) => {
        e.preventDefault();
        localStorage.setItem('admin_remember', rememberMe);
        socket.emit('admin_login', { password: pass });
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_remember');
        window.location.reload();
    };

    const handleKick = (id, isRefusal = false) => {
        const reason = prompt(isRefusal ? "Motif du refus ?" : "Motif de l'exclusion ?");
        if (reason !== null) emitAdmin('admin_kick_user', { socketId: id, reason, isRefusal });
    };

    // --- RENDU LOGIN ---
    if (!auth) return (
        <div className="card" style={{maxWidth:'400px', margin:'100px auto', textAlign:'center'}}>
            <h2>{t(ui, 'ADMIN_TITLE', 'Accès Régie')}</h2>
            <form onSubmit={handleLogin}>
                <input type="password" placeholder="Mot de passe" onChange={e => setPass(e.target.value)} autoFocus style={{width:'100%', marginBottom:'10px'}} />

                <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <input type="checkbox" id="rem" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                    <label htmlFor="rem" style={{fontSize:'0.9rem'}}>Se souvenir de moi</label>
                </div>

                <button className="btn-primary" style={{width:'100%'}} type="submit">Connexion</button>
            </form>
        </div>
    );

    // --- RENDU DASHBOARD ---
    return (
        <div className="app-container">
            {!isConnected && (
                <div className="connexion-error-banner">
                    ⚠️ {t(ui, 'CONNECTION_LOST', 'CONNEXION PERDUE')}
                    <button onClick={() => window.location.reload()} className="btn-primary">Actualiser</button>
                </div>
            )}

            <div style={{ opacity: isConnected ? 1 : 0.5, pointerEvents: isConnected ? 'all' : 'none' }}>

                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>Admin Panel</h1>
                    <button onClick={handleLogout} className="btn-danger">Déconnexion</button>
                </header>

                {/* Utilisation du helper emitAdmin pour changer de scène */}
                <div className="card">
                    <h3>{t(ui, 'ADMIN_SCENE_SELECT', 'Scène Actuelle')}</h3>
                    <div style={{display:'flex', flexWrap:'wrap', gap:'10px'}}>
                        {state?.playlist.map((act, i) => (
                            <button
                                key={act.id}
                                className={state.currentIndex === i ? "btn-primary" : ""}
                                onClick={() => emitAdmin('admin_set_scene', { index: i })}
                            >
                                {act.title}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={allowJoins}
                                onChange={() => emitAdmin('admin_toggle_joins', { value: !allowJoins })}
                            />
                            <span className="slider"></span>
                        </label>
                        <h4 style={{ margin: 0 }}>{allowJoins ? 'Inscriptions Ouvertes' : 'Fermées'}</h4>
                    </div>
                </div>

                <div className="admin-grid">
                    <section className="card">
                        <h3>Demandes ({requests.length})</h3>
                        {requests.map(r => (
                            <div key={r.socketId} className="user-row">
                                <strong>{r.name}</strong>
                                <div>
                                    <button onClick={() => emitAdmin('admin_approve_user', { socketId: r.socketId })}>Accepter</button>
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
                                        if(newName) emitAdmin('admin_rename_user', { socketId: u.socketId, newName });
                                    }}>Editer</button>
                                    <button className="btn-danger" onClick={() => handleKick(u.socketId, false)}>Kick</button>
                                </div>
                            </div>
                        ))}
                    </section>
                </div>

                {/* On passe le helper et le token au sous-composant */}
                <SceneControl
                    currentScene={state?.currentScene}
                    proposals={proposals}
                    socket={socket}
                    token={token}
                    emitAdmin={emitAdmin}
                />
            </div>
        </div>
    );
};

export default AdminView;