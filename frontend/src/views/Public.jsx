import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

//scenes imports
import ProposalScene from '../components/scenes/ProposalScene';
import WaitingScene from '../components/scenes/WaitingScene';

const socket = io(`http://${window.location.hostname}:3000`);

const PublicView = () => {
    const [name, setName] = useState('');
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');
    const [gameState, setGameState] = useState(null);
    const [history, setHistory] = useState([]);

    const nameRef = useRef('');
    useEffect(() => { nameRef.current = name; }, [name]);

    useEffect(() => {
        const savedName = localStorage.getItem('player_name');
        if (savedName) {
            setName(savedName);
            setStatus('pending');
            socket.emit('join_request', { name: savedName, isReconnect: true });
        }

        socket.on('status_update', (data) => {
            setStatus(data.status);
            if (data.status === 'approved') {
                const finalName = data.name || nameRef.current;
                localStorage.setItem('player_name', finalName);
                if (data.name) setName(data.name);
                setMessage('');
            } else {
                setMessage(data.reason || '');
                if (data.status === 'session_expired' || data.status === 'kicked') {
                    localStorage.removeItem('player_name');
                }
            }
        });

        socket.on('sync_state', (state) => setGameState(state));
        socket.on('name_updated', (newName) => {
            setName(newName);
            localStorage.setItem('player_name', newName);
        });

        socket.on('user_history_update', (userProposals) => setHistory(userProposals));

        return () => {
            socket.off('status_update');
            socket.off('sync_state');
            socket.off('name_updated');
            socket.off('user_history_update');
        };
    }, []);

    const handleJoin = (e) => {
        if (e) e.preventDefault();
        if (!name.trim()) return;
        setMessage('');
        setStatus('pending');
        socket.emit('join_request', { name: name.trim(), isReconnect: false });
    };

    // --- AFFICHAGE LOGIN / PENDING ---
    if (status === 'idle' || status === 'session_expired' || status === 'rejected' || status === 'kicked') {
        return (
            <div className="card">
                <h2>Spectacle Live</h2>
                <form onSubmit={handleJoin}>
                    <input placeholder="Votre Nom" value={name} onChange={e => setName(e.target.value)} />
                    <button type="submit" className="btn-primary" style={{width:'100%', marginTop:'10px'}}>Rejoindre</button>
                </form>
                {message && <div className="error-box" style={{marginTop:'15px'}}>{message}</div>}
            </div>
        );
    }

    if (status === 'pending') {
        return (
            <div className="card" style={{textAlign:'center'}}><div className="spinner"></div><h3>Connexion...</h3></div>
        );
    }

    // --- ROUTAGE DES SCENES ---
    const renderScene = () => {
        const sceneType = gameState?.currentScene?.type;
        const props = { socket, name, gameState, history };

        switch (sceneType) {
            case 'PROPOSAL':
                return <ProposalScene {...props} />;
            case 'WAITING':
                return <WaitingScene {...props} />;
            default:
                return <div style={{textAlign:'center'}}>Préparez vos téléphones...</div>;
        }
    };

    return (
        <div className="card">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Joueur: {name}</h3>
                <div className="status-dot" style={{ background: '#2ecc71', width: 10, height: 10, borderRadius: '50%' }}></div>
            </header>
            <hr />
            {renderScene()}
        </div>
    );
};

export default PublicView;