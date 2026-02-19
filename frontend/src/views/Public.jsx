import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io(`http://${window.location.hostname}:3000`);

const PublicView = () => {
    const [name, setName] = useState('');
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');
    const [gameState, setGameState] = useState(null);
    const [answer, setAnswer] = useState('');
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

        socket.on('user_history_update', (userAnswers) => {
            setHistory(userAnswers);
        });

        return () => {
            socket.off('status_update');
            socket.off('sync_state');
            socket.off('name_updated');
        };
    }, []);

    const handleJoin = (e) => {
        if (e) e.preventDefault();
        if (!name.trim()) return;
        setMessage('');
        setStatus('pending');
        socket.emit('join_request', { name: name.trim(), isReconnect: false });
    };

    if (status === 'idle' || status === 'session_expired' || status === 'rejected' || status === 'kicked') {
        return (
            <div className="card">
                <h2>Spectacle Live</h2>
                <form onSubmit={handleJoin}>
                    <input
                        placeholder="Votre Nom"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                    <button type="submit" className="btn-primary" style={{width:'100%', marginTop:'10px'}}>
                        Rejoindre
                    </button>
                </form>
                {message && <div className="error-box" style={{marginTop:'15px'}}>{message}</div>}
            </div>
        );
    }

    if (status === 'pending') {
        return (
            <div className="card" style={{textAlign:'center'}}>
                <div className="spinner"></div>
                <h3>Connexion...</h3>
                <p style={{opacity:0.6}}>Attente de validation</p>
            </div>
        );
    }

    return (
        <div className="card">
            <h3>Joueur: {name}</h3>
            <hr />
            {gameState?.currentAct.type === 'ANSWER' && (
                <>
                    <div className="input-group">
                        <input
                            value={answer}
                            onChange={e => setAnswer(e.target.value)}
                            placeholder={history.length >= 5 ? "Limite atteinte" : "Ta réponse..."}
                            disabled={history.length >= 5}
                        />
                        <button
                            className="btn-primary"
                            onClick={() => { socket.emit('send_answer', {userName: name, text: answer}); setAnswer(''); }}
                            disabled={!answer.trim() || history.length >= 5}
                        >
                            Envoyer
                        </button>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        <h4>Tes envois ({history.length}/5) :</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            {history.map(h => (
                                <div key={h.id} style={{
                                    padding: '8px',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '4px',
                                    borderLeft: h.isWinner ? '3px solid gold' : 'none',
                                    fontSize: '0.9rem'
                                }}>
                                    {h.text} {h.isWinner && "🏆"}
                                    <small style={{ float: 'right', opacity: 0.5 }}>{h.timestamp}</small>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PublicView;