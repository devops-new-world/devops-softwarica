const express = require('express');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// POST /api/scores  (CREATE)
router.post('/', authMiddleware, (req, res) => {
  try {
    const { score, level_reached } = req.body;
    if (score == null || level_reached == null)
      return res.status(400).json({ error: 'score and level_reached required' });

    db.run(
      'INSERT INTO scores (user_id, score, level_reached) VALUES (?, ?, ?)',
      [req.user.id, score, level_reached]
    );

    const saved = db.get(
      'SELECT * FROM scores WHERE user_id = ? ORDER BY id DESC LIMIT 1',
      [req.user.id]
    );
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/scores/me  (READ - my scores)
router.get('/me', authMiddleware, (req, res) => {
  const scores = db.all(
    'SELECT * FROM scores WHERE user_id = ? ORDER BY score DESC',
    [req.user.id]
  );
  res.json(scores);
});

// GET /api/scores/leaderboard  (READ - global top 10)
router.get('/leaderboard', (req, res) => {
  const rows = db.all(`
    SELECT s.id, s.score, s.level_reached, s.played_at, u.username
    FROM scores s
    JOIN users u ON s.user_id = u.id
    ORDER BY s.score DESC
    LIMIT 10
  `);
  res.json(rows);
});

// GET /api/scores/:id  (READ single)
router.get('/:id', authMiddleware, (req, res) => {
  const score = db.get(
    'SELECT * FROM scores WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );
  if (!score) return res.status(404).json({ error: 'Score not found' });
  res.json(score);
});

// PUT /api/scores/:id  (UPDATE - add note or correction)
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { score, level_reached } = req.body;
    const existing = db.get(
      'SELECT * FROM scores WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!existing) return res.status(404).json({ error: 'Score not found' });

    db.run(
      'UPDATE scores SET score = ?, level_reached = ? WHERE id = ?',
      [score ?? existing.score, level_reached ?? existing.level_reached, req.params.id]
    );
    res.json(db.get('SELECT * FROM scores WHERE id = ?', [req.params.id]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/scores/:id  (DELETE)
router.delete('/:id', authMiddleware, (req, res) => {
  const existing = db.get(
    'SELECT * FROM scores WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );
  if (!existing) return res.status(404).json({ error: 'Score not found' });
  db.run('DELETE FROM scores WHERE id = ?', [req.params.id]);
  res.json({ message: 'Score deleted' });
});

module.exports = router;
