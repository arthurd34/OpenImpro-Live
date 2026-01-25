import React, { useEffect, useState } from 'react';
import { createSession, listSessions, getPlayers, validatePlayer } from '../api/api';

export default function AdminDashboard() {
  const [sessions, setSessions] = useState([]);
  const [newCode, setNewCode] = useState('');
  const [players, setPlayers] = useState({});

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    const res = await listSessions();
    setSessions(res.data);
  };

  const handleCreateSession = async () => {
    if (newCode.length !== 4) return alert('Code must be 4 chars');
    await createSession(newCode);
    setNewCode('');
    fetchSessions();
  };

  const fetchPlayers = async (code) => {
    const res = await getPlayers(code);
    setPlayers((prev) => ({ ...prev, [code]: res.data }));
  };

  const handleValidate = async (playerId, code) => {
    await validatePlayer(playerId);
    fetchPlayers(code);
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>

      <div>
        <input value={newCode} onChange={(e) => setNewCode(e.target.value.toUpperCase())} maxLength={4} />
        <button onClick={handleCreateSession}>Create Session</button>
      </div>

      <h2>Sessions</h2>
      {sessions.map((s) => (
        <div key={s.id}>
          <h3>{s.code}</h3>
          <button onClick={() => fetchPlayers(s.code)}>Show Players</button>
          <ul>
            {players[s.code]?.map((p) => (
              <li key={p.id}>
                {p.name} - {p.validated ? '✅' : '❌'}
                {!p.validated && <button onClick={() => handleValidate(p.id, s.code)}>Validate</button>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
