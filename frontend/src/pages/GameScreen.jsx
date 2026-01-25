import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPlayers } from '../api/api';

export default function GameScreen() {
  const { code } = useParams();
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const res = await getPlayers(code);
      setPlayers(res.data);
    };
    fetch();
  }, [code]);

  return (
    <div>
      <h1>Game Screen - Session {code}</h1>
      <h2>Players</h2>
      <ul>
        {players.map((p) => (
          <li key={p.id}>{p.name} - {p.validated ? '✅' : '❌'}</li>
        ))}
      </ul>
    </div>
  );
}
