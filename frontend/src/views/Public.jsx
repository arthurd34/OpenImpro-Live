import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

// Imports des composants de scènes
import ConnectionScene from '../components/scenes/ConnectionScene';
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

        return () => socket.off();
    }, []);

    const handleJoin = (e) => {
        if (e) e.preventDefault();
        if (!name.trim()) return;
        setMessage('');
        setStatus('pending');
        socket.emit('join_request', { name: name.trim(), isReconnect: false });
    };

    // --- ROUTAGE PRINCIPAL ---

    // Si l'utilisateur n'est pas encore approuvé, on affiche la scène de connexion
    if (status !== 'approved') {
        return (
            <ConnectionScene
                name={name}
                setName={setName}
                handleJoin={handleJoin}
                status={status}
                message={message}
            />
        );
    }

    // Si approuvé, on affiche le header et la scène de jeu actuelle
    const sceneType = gameState?.currentScene?.type;
    const sceneProps = { socket, name, gameState, history };

    return (
        <div className="card">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>{name}</h3>
                <div className="status-dot" style={{ background: '#2ecc71', width: 10, height: 10, borderRadius: '50%' }}></div>
            </header>
            <hr />

            {(() => {
                switch (sceneType) {
                    case 'PROPOSAL': return <ProposalScene {...sceneProps} />;
                    case 'WAITING':  return <WaitingScene {...sceneProps} />;
                    default: return <div style={{textAlign:'center', padding:'20px'}}>Connecté ! Attente du début...</div>;
                }
            })()}
        </div>
    );
};

export default PublicView;