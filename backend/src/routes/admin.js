const express = require('express');
const router = express.Router();
const pool = require('../db');

// Create a session
router.post('/sessions', async (req, res) => {
  const { code } = req.body;
  if (!code || code.length !== 4) return res.status(400).json({ ok: false, message: 'Code must be 4 chars' });

  try {
    await pool.query('INSERT INTO sessions (code) VALUES ($1)', [code]);
    res.json({ ok: true, message: 'Session created' });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// List all sessions
router.get('/sessions', async (req, res) => {
  const result = await pool.query('SELECT * FROM sessions ORDER BY created_at DESC');
  res.json(result.rows);
});

// Validate a player
router.post('/players/validate', async (req, res) => {
  const { playerId } = req.body;
  await pool.query('UPDATE players SET validated = TRUE WHERE id=$1', [playerId]);
  res.json({ ok: true });
});

module.exports = router;
