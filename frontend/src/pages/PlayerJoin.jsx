import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { joinSession } from '../api/api';

export default function PlayerJoin() {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (!name || code.length !== 4) return alert('Enter name and 4-char code');
    try {
      await joinSession(name, code.toUpperCase());
      navigate(`/sessions/${code.toUpperCase()}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Error joining session');
    }
  };

  return (
    <div>
      <h1>Join Game</h1>
      <input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="Session code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={4} />
      <button onClick={handleJoin}>Join</button>
    </div>
  );
}
