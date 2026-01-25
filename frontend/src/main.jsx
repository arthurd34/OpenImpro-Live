import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import PlayerJoin from './pages/PlayerJoin';
import GameScreen from './pages/GameScreen';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/" element={<PlayerJoin />} />
      <Route path="/sessions/:code" element={<GameScreen />} />
    </Routes>
  </BrowserRouter>
);
