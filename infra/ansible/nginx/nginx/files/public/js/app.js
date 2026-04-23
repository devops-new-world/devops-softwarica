// ─── APP CONTROLLER ───────────────────────────────────────────────────────────
const App = (() => {
  let currentUser = null;
  let myHighScore = 0;

  // ── SCREEN ROUTING ──────────────────────────────────────────────────────────
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  // ── AUTH TABS ───────────────────────────────────────────────────────────────
  document.querySelectorAll('.auth-tabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.auth-tabs .tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    });
  });

  // ── REGISTER ────────────────────────────────────────────────────────────────
  document.getElementById('btn-register').addEventListener('click', async () => {
    const username = document.getElementById('reg-username').value.trim();
    const email    = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const errEl    = document.getElementById('reg-error');
    errEl.textContent = '';
    try {
      const data = await API.register(username, email, password);
      currentUser = data.user;
      enterGame();
    } catch (e) { errEl.textContent = e.message; }
  });

  // ── LOGIN ────────────────────────────────────────────────────────────────────
  document.getElementById('btn-login').addEventListener('click', async () => {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const errEl    = document.getElementById('login-error');
    errEl.textContent = '';
    try {
      const data = await API.login(username, password);
      currentUser = data.user;
      enterGame();
    } catch (e) { errEl.textContent = e.message; }
  });

  // Allow Enter key on password fields
  ['login-password', 'reg-password'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const isLogin = id === 'login-password';
        document.getElementById(isLogin ? 'btn-login' : 'btn-register').click();
      }
    });
  });

  // ── ENTER GAME ───────────────────────────────────────────────────────────────
  async function enterGame() {
    document.getElementById('hud-player').textContent = currentUser.username.toUpperCase();
    await refreshHighScore();
    showScreen('screen-game');
  }

  async function refreshHighScore() {
    try {
      const scores = await API.myScores();
      myHighScore = scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0;
      document.getElementById('hud-highscore').textContent = myHighScore;
    } catch (_) {}
  }

  // ── LOGOUT ───────────────────────────────────────────────────────────────────
  document.getElementById('btn-logout').addEventListener('click', async () => {
    await API.logout();
    currentUser = null;
    myHighScore = 0;
    document.getElementById('hud-level').textContent = '0';
    document.getElementById('center-level').textContent = '--';
    document.getElementById('game-status').textContent = 'PRESS START TO PLAY';
    document.getElementById('game-status').className = 'game-status';
    showScreen('screen-auth');
  });

  // ── GAME OVER ────────────────────────────────────────────────────────────────
  Simon.on('gameover', async ({ level, score }) => {
    // Save score
    try {
      await API.saveScore(score, level);
      if (score > myHighScore) {
        myHighScore = score;
        document.getElementById('hud-highscore').textContent = myHighScore;
      }
    } catch (_) {}

    document.getElementById('go-level').textContent = level;
    document.getElementById('go-score').textContent = score;

    // Check leaderboard rank
    try {
      const lb = await API.leaderboard();
      const rank = lb.findIndex(r => r.username === currentUser.username && r.score === score);
      const rankEl = document.getElementById('go-rank');
      if (rank >= 0) {
        const medals = ['🥇', '🥈', '🥉'];
        rankEl.textContent = `${medals[rank] || '🎮'} GLOBAL RANK #${rank + 1}`;
      } else {
        rankEl.textContent = '';
      }
    } catch (_) {}

    document.getElementById('overlay-gameover').classList.remove('hidden');
  });

  document.getElementById('btn-play-again').addEventListener('click', () => {
    document.getElementById('overlay-gameover').classList.add('hidden');
    Simon.startGame();
  });

  document.getElementById('btn-go-scores').addEventListener('click', () => {
    document.getElementById('overlay-gameover').classList.add('hidden');
    openLeaderboard();
  });

  // ── LEADERBOARD ──────────────────────────────────────────────────────────────
  document.getElementById('btn-go-leaderboard').addEventListener('click', openLeaderboard);
  document.getElementById('lb-back').addEventListener('click', () => showScreen('screen-game'));

  let lbCurrentTab = 'global';
  document.getElementById('lb-tab-global').addEventListener('click', () => {
    lbCurrentTab = 'global';
    document.getElementById('lb-tab-global').classList.add('active');
    document.getElementById('lb-tab-mine').classList.remove('active');
    loadLeaderboard();
  });
  document.getElementById('lb-tab-mine').addEventListener('click', () => {
    lbCurrentTab = 'mine';
    document.getElementById('lb-tab-mine').classList.add('active');
    document.getElementById('lb-tab-global').classList.remove('active');
    loadMyScores();
  });

  async function openLeaderboard() {
    lbCurrentTab = 'global';
    document.getElementById('lb-tab-global').classList.add('active');
    document.getElementById('lb-tab-mine').classList.remove('active');
    showScreen('screen-leaderboard');
    await loadLeaderboard();
  }

  async function loadLeaderboard() {
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '<div class="empty-state">Loading...</div>';
    try {
      const rows = await API.leaderboard();
      if (!rows.length) { list.innerHTML = '<div class="empty-state">No scores yet. Be the first!</div>'; return; }
      list.innerHTML = '';
      rows.forEach((row, i) => {
        const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
        const medals = ['🥇','🥈','🥉'];
        const item = document.createElement('div');
        item.className = 'score-item';
        item.innerHTML = `
          <span class="rank ${rankClass}">${medals[i] || '#' + (i+1)}</span>
          <span class="player">${escHtml(row.username)}</span>
          <span class="level-val">Lv.${row.level_reached}</span>
          <span class="score-val">${row.score}</span>
        `;
        list.appendChild(item);
      });
    } catch (e) { list.innerHTML = `<div class="empty-state">${e.message}</div>`; }
  }

  async function loadMyScores() {
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '<div class="empty-state">Loading...</div>';
    try {
      const rows = await API.myScores();
      if (!rows.length) { list.innerHTML = '<div class="empty-state">No scores yet. Play a game!</div>'; return; }
      list.innerHTML = '';
      rows.forEach((row) => {
        const item = document.createElement('div');
        item.className = 'score-item';
        const date = new Date(row.played_at).toLocaleDateString();
        item.innerHTML = `
          <span class="rank">#</span>
          <span class="player">${date}</span>
          <span class="level-val">Lv.${row.level_reached}</span>
          <span class="score-val">${row.score}</span>
          <button class="delete-score" data-id="${row.id}">✕</button>
        `;
        item.querySelector('.delete-score').addEventListener('click', async (e) => {
          if (!confirm('Delete this score?')) return;
          const id = e.target.dataset.id;
          await API.deleteScore(id);
          await refreshHighScore();
          await loadMyScores();
        });
        list.appendChild(item);
      });
    } catch (e) { list.innerHTML = `<div class="empty-state">${e.message}</div>`; }
  }

  // ── PROFILE ───────────────────────────────────────────────────────────────────
  document.getElementById('btn-go-profile').addEventListener('click', openProfile);
  document.getElementById('profile-back').addEventListener('click', () => showScreen('screen-game'));

  async function openProfile() {
    showScreen('screen-profile');
    document.getElementById('profile-error').textContent = '';
    document.getElementById('profile-success').textContent = '';
    try {
      const [user, scores] = await Promise.all([API.me(), API.myScores()]);
      currentUser = user;
      document.getElementById('upd-username').placeholder = user.username;
      document.getElementById('upd-email').placeholder = user.email;

      const best = scores.length ? Math.max(...scores.map(s => s.score)) : 0;
      const bestLv = scores.length ? Math.max(...scores.map(s => s.level_reached)) : 0;
      const stats = document.getElementById('profile-stats');
      stats.innerHTML = `
        <div class="stat-card"><div class="stat-label">USERNAME</div><div class="stat-val" style="font-size:0.55rem">${escHtml(user.username)}</div></div>
        <div class="stat-card"><div class="stat-label">GAMES PLAYED</div><div class="stat-val">${scores.length}</div></div>
        <div class="stat-card"><div class="stat-label">BEST SCORE</div><div class="stat-val">${best}</div></div>
        <div class="stat-card"><div class="stat-label">MAX LEVEL</div><div class="stat-val">${bestLv}</div></div>
      `;
    } catch (e) { document.getElementById('profile-error').textContent = e.message; }
  }

  // UPDATE profile
  document.getElementById('btn-update-profile').addEventListener('click', async () => {
    const errEl = document.getElementById('profile-error');
    const okEl  = document.getElementById('profile-success');
    errEl.textContent = ''; okEl.textContent = '';
    const payload = {
      password:    document.getElementById('upd-curpw').value,
      username:    document.getElementById('upd-username').value.trim() || undefined,
      email:       document.getElementById('upd-email').value.trim() || undefined,
      newPassword: document.getElementById('upd-newpw').value || undefined,
    };
    if (!payload.password) { errEl.textContent = 'Current password is required'; return; }
    try {
      const data = await API.updateMe(payload);
      currentUser = data.user;
      document.getElementById('hud-player').textContent = currentUser.username.toUpperCase();
      okEl.textContent = '✓ Profile updated!';
      document.getElementById('upd-curpw').value = '';
      document.getElementById('upd-newpw').value = '';
    } catch (e) { errEl.textContent = e.message; }
  });

  // DELETE account
  document.getElementById('btn-delete-account').addEventListener('click', async () => {
    const pass = document.getElementById('del-password').value;
    if (!pass) { document.getElementById('profile-error').textContent = 'Enter your password to delete'; return; }
    if (!confirm('Permanently delete your account and all scores? This cannot be undone.')) return;
    try {
      await API.deleteMe(pass);
      currentUser = null;
      showScreen('screen-auth');
    } catch (e) { document.getElementById('profile-error').textContent = e.message; }
  });

  // ── INIT ─────────────────────────────────────────────────────────────────────
  async function init() {
    try {
      const user = await API.me();
      currentUser = user;
      await enterGame();
    } catch (_) {
      showScreen('screen-auth');
    }
  }

  function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  init();
})();
