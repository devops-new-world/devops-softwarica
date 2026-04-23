// ─── SIMON GAME ENGINE ────────────────────────────────────────────────────────
const Simon = (() => {
  const COLORS = ['green', 'red', 'yellow', 'blue'];
  const FREQS  = { green: 415, red: 310, yellow: 252, blue: 209 };

  let sequence = [];
  let playerSeq = [];
  let level = 0;
  let active = false;
  let strictMode = false;

  let audioCtx = null;

  function getAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  function playTone(color, duration = 300) {
    try {
      const ctx = getAudio();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(FREQS[color], ctx.currentTime);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration / 1000);
    } catch (e) { /* audio blocked */ }
  }

  function playError() {
    try {
      const ctx = getAudio();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) { /* audio blocked */ }
  }

  function lightBtn(color, on) {
    const el = document.getElementById(`btn-${color}`);
    if (on) el.classList.add('lit');
    else el.classList.remove('lit');
  }

  function flashBtn(color, duration = 300) {
    return new Promise(res => {
      lightBtn(color, true);
      playTone(color, duration);
      setTimeout(() => { lightBtn(color, false); setTimeout(res, 80); }, duration);
    });
  }

  function setStatus(msg, cls = '') {
    const el = document.getElementById('game-status');
    el.textContent = msg;
    el.className = 'game-status' + (cls ? ' ' + cls : '');
  }

  function setLevel(n) {
    document.getElementById('hud-level').textContent = n;
    document.getElementById('center-level').textContent = n || '--';
  }

  function disableButtons(disabled) {
    COLORS.forEach(c => { document.getElementById(`btn-${c}`).disabled = disabled; });
  }

  async function playSequence() {
    disableButtons(true);
    setStatus('WATCH CAREFULLY...', '');
    const speed = Math.max(150, 400 - level * 15);
    await new Promise(r => setTimeout(r, 600));
    for (const color of sequence) {
      await flashBtn(color, speed);
      await new Promise(r => setTimeout(r, 50));
    }
    disableButtons(false);
    setStatus('YOUR TURN!', 'success');
    playerSeq = [];
  }

  function calcScore(lvl) { return lvl * 100 + (lvl > 5 ? (lvl - 5) * 50 : 0); }

  const callbacks = {};
  function on(event, cb) { callbacks[event] = cb; }
  function emit(event, data) { if (callbacks[event]) callbacks[event](data); }

  function startGame() {
    sequence = [];
    playerSeq = [];
    level = 0;
    active = true;
    document.getElementById('btn-start-game').disabled = true;
    nextRound();
  }

  function nextRound() {
    level++;
    setLevel(level);
    sequence.push(COLORS[Math.floor(Math.random() * 4)]);
    setTimeout(() => playSequence(), 400);
  }

  async function handleInput(color) {
    if (!active) return;
    playerSeq.push(color);
    await flashBtn(color, 200);

    const idx = playerSeq.length - 1;
    if (playerSeq[idx] !== sequence[idx]) {
      // WRONG
      active = false;
      disableButtons(true);
      playError();
      setStatus('WRONG! GAME OVER', 'error');
      // flash all red
      for (let i = 0; i < 3; i++) {
        await new Promise(r => setTimeout(r, 200));
        COLORS.forEach(c => lightBtn(c, true));
        await new Promise(r => setTimeout(r, 150));
        COLORS.forEach(c => lightBtn(c, false));
      }
      document.getElementById('btn-start-game').disabled = false;
      emit('gameover', { level, score: calcScore(level - 1) });
      return;
    }

    if (playerSeq.length === sequence.length) {
      // Correct full sequence
      disableButtons(true);
      setStatus(`LEVEL ${level} COMPLETE! ✓`, 'success');
      await new Promise(r => setTimeout(r, 800));
      nextRound();
    }
  }

  // Wire up buttons
  COLORS.forEach(color => {
    document.getElementById(`btn-${color}`).addEventListener('click', () => handleInput(color));
  });

  document.getElementById('btn-start-game').addEventListener('click', startGame);

  return { startGame, on, calcScore };
})();
