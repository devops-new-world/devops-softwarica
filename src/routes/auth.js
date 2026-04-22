const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db/database');
const { authMiddleware, signToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: 'All fields required' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const existing = db.get(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    if (existing) return res.status(409).json({ error: 'Username or email already taken' });

    const hash = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)', [
      username, email, hash
    ]);

    const user = db.get('SELECT id, username, email FROM users WHERE username = ?', [username]);
    const token = signToken({ id: user.id, username: user.username });

    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ message: 'Registered successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: 'Username and password required' });

    const user = db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken({ id: user.id, username: user.username });
    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ message: 'Login successful', user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  const user = db.get('SELECT id, username, email, created_at FROM users WHERE id = ?', [req.user.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// PUT /api/auth/me  (UPDATE - change username or email)
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { username, email, password, newPassword } = req.body;
    const user = db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Verify current password
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Current password incorrect' });

    const newHash = newPassword ? await bcrypt.hash(newPassword, 10) : user.password_hash;
    const newUsername = username || user.username;
    const newEmail = email || user.email;

    // Check uniqueness
    const conflict = db.get(
      'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
      [newUsername, newEmail, req.user.id]
    );
    if (conflict) return res.status(409).json({ error: 'Username or email already taken' });

    db.run(
      'UPDATE users SET username = ?, email = ?, password_hash = ? WHERE id = ?',
      [newUsername, newEmail, newHash, req.user.id]
    );

    res.json({ message: 'Profile updated', user: { id: req.user.id, username: newUsername, email: newEmail } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/auth/me  (DELETE account)
router.delete('/me', authMiddleware, async (req, res) => {
  try {
    const { password } = req.body;
    const user = db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Password incorrect' });

    db.run('DELETE FROM scores WHERE user_id = ?', [req.user.id]);
    db.run('DELETE FROM users WHERE id = ?', [req.user.id]);
    res.clearCookie('token');
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
