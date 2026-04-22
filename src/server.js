const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const { initDB } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/scores', require('./routes/scores'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

async function start() {
  await initDB();
  app.listen(PORT, () => {
    console.log(`🎮 Simon Game running at http://localhost:${PORT}`);
  });
}

start();
