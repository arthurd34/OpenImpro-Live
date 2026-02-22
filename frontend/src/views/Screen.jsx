import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const protocol = window.location.protocol;
const hostname = window.location.hostname;

const socket = io(`http://${protocol}//${hostname}:3000`);

const ScreenView = () => {
    const [gameState, setGameState] = useState(null);
    const [winner, setWinner] = useState(null);

    useEffect(() => {
        // The server sends sync_state as soon as anyone connects
        socket.on('sync_state', (state) => {
            setGameState(state);
            setWinner(null);
        });

        socket.on('show_on_screen', (data) => setWinner(data));

        return () => socket.off();
    }, []);

    if (!gameState) return <div className="screen-container">Initializing...</div>;

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {gameState.currentScene.type === 'WAITING' ? (
                <h1 style={{ fontSize: '6rem', color: 'var(--primary)' }}>OPEN IMPRO LIVE</h1>
            ) : (
                <div style={{textAlign: 'center'}}>
                    {winner ? (
                        <div className="winner-card">
                            <h2 style={{color:'var(--primary)'}}>BY {winner.userName}</h2>
                            <h1 style={{fontSize:'7rem'}}>{winner.text}</h1>
                        </div>
                    ) : (
                        <h1 style={{fontSize:'4rem'}}>{gameState.currentScene.title}</h1>
                    )}
                </div>
            )}
        </div>
    );
};

export default ScreenView;