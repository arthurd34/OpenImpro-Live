// src/views/PublicView.jsx
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { t } from '../utils/i18n';

// Scene Components Imports
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
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [countdown, setCountdown] = useState(15);

    const timerRef = useRef(null);
    const nameRef = useRef('');

    // --- Translation Helper Context ---
    const ui = gameState?.ui || {};

    useEffect(() => {
        // --- Socket Connectivity Management ---
        const onConnect = () => {
            setIsConnected(true);
            setCountdown(15);
            if (timerRef.current) clearInterval(timerRef.current);

            // Auto-reconnect with token if connection was lost
            const token = localStorage.getItem('player_token');
            if (token) socket.emit('join_request', { token, isReconnect: true });
        };

        const onDisconnect = () => {
            setIsConnected(false);
            // Start countdown for auto-refresh on failure
            timerRef.current = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        window.location.reload();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    useEffect(() => { nameRef.current = name; }, [name]);

    useEffect(() => {
        // --- Session Recovery on Mount ---
        const savedToken = localStorage.getItem('player_token');
        const savedName = localStorage.getItem('player_name');

        if (savedToken) {
            if (savedName) setName(savedName);
            setStatus('pending');
            // Identify by token instead of name for security
            socket.emit('join_request', { token: savedToken, isReconnect: true });
        }

        // --- Server Status Updates ---
        socket.on('status_update', (data) => {
            setStatus(data.status);

            // Save token if provided (happens on pending or approved)
            if (data.token) {
                localStorage.setItem('player_token', data.token);
            }

            if (data.status === 'approved') {
                const finalName = data.name || nameRef.current;
                localStorage.setItem('player_name', finalName);
                if (data.name) setName(data.name);
                setMessage('');
            } else {
                setMessage(data.reason || '');
                // Cleanup on terminal states
                if (['rejected', 'kicked', 'session_expired'].includes(data.status)) {
                    localStorage.removeItem('player_name');
                    localStorage.removeItem('player_token');
                    socket.disconnect();
                    setTimeout(() => socket.connect(), 1000);
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
        // Initial request only sends the name
        socket.emit('join_request', { name: name.trim(), isReconnect: false });
    };

    // --- UI COMPONENTS ---

    const ConnectionErrorOverlay = () => (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, textAlign: 'center', padding: '20px'
        }}>
            <div className="spinner"></div>
            <h2 style={{ color: '#e74c3c' }}>{t(ui, 'CONNECTION_LOST')}</h2>
            <p>{t(ui, 'RECONNECTING')}</p>
            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                {t(ui, 'REFRESH_IN')} <strong>{countdown}s</strong>
            </p>
            <button
                className="btn-primary"
                style={{ marginTop: '20px' }}
                onClick={() => window.location.reload()}
            >
                {t(ui, 'REFRESH_NOW')}
            </button>
        </div>
    );

    // --- MAIN ROUTING ---

    // 1. Connection phase (Login or Pending)
    if (status !== 'approved') {
        return (
            <ConnectionScene
                name={name}
                setName={setName}
                handleJoin={handleJoin}
                status={status}
                message={message}
                ui={ui}
            />
        );
    }

    const sceneType = gameState?.currentScene?.type;
    // We pass the token in props if needed by sub-scenes (e.g. for secure voting)
    const sceneProps = {
        socket,
        name,
        gameState,
        history,
        token: localStorage.getItem('player_token')
    };

    // 2. Gameplay phase
    return (
        <div className="card">
            {!isConnected && <ConnectionErrorOverlay />}

            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>{name}</h3>
                <div className="status-dot" style={{
                    background: isConnected ? '#2ecc71' : '#e74c3c',
                    width: 10, height: 10, borderRadius: '50%'
                }}></div>
            </header>
            <hr />

            {(() => {
                switch (sceneType) {
                    case 'PROPOSAL': return <ProposalScene {...sceneProps} />;
                    case 'WAITING':  return <WaitingScene {...sceneProps} />;
                    default: return (
                        <div style={{textAlign:'center', padding:'20px'}}>
                            {t(ui, 'WAITING_FOR_START')}
                        </div>
                    );
                }
            })()}
        </div>
    );
};

export default PublicView;