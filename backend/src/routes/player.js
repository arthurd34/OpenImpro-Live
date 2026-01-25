const express = require('express');
const router = express.Router();
const pool = require('../db');

// Join a session
router.post('/join', async (req, res) => {
  const { name, code } = req.body;
  const session = await pool.query('SELECT * FROM sessions WHERE code=$1', [code]);
  if (session.rowCount === 0) return res.status(404).json({ ok: false, message: 'Session not found' });

  const result = await pool.query('INSERT INTO players (session_code) VALUES ($1,$2) RETURNING *', [name, code]);
  res.json({ ok: true, player: result.rows[0] });
});

// List players in a session
router.get('/session/:code/players', async (req, res) => {
  const { code } = req.params;
  const result = await pool.query('SELECT * FROM players WHERE session_code=$1', [code]);
  res.json(result.rows);
});

module.exports = router;
