import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:3000' });

// Admin
export const createSession = (code) => API.post('/admin/sessions', { code });
export const listSessions = () => API.get('/admin/sessions');
export const validatePlayer = (id) => API.post('/admin/players/validate', { playerId: id });

// Player
export const joinSession = (name, code) => API.post('/player/join', { name, code });
export const getPlayers = (code) => API.get(`/player/session/${code}/players`);
