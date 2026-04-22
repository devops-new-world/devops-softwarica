const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'simon-says-keep-it-secret-2024';

function authMiddleware(req, res, next) {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

module.exports = { authMiddleware, signToken };
