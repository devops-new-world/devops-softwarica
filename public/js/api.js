// ─── API CLIENT ───────────────────────────────────────────────────────────────
// comment
// comment
// comment
// comment
// comment
// comment
// comment
// comment

const API = {
  async request(method, path, body) {
    const opts = {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(path, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  },

  // AUTH
  register: (u, e, p) => API.request('POST', '/api/auth/register', { username: u, email: e, password: p }),
  login:    (u, p)    => API.request('POST', '/api/auth/login',    { username: u, password: p }),
  logout:   ()        => API.request('POST', '/api/auth/logout'),
  me:       ()        => API.request('GET',  '/api/auth/me'),
  updateMe: (data)    => API.request('PUT',  '/api/auth/me', data),
  deleteMe: (pass)    => API.request('DELETE','/api/auth/me', { password: pass }),

  // SCORES
  saveScore:   (score, level) => API.request('POST',   '/api/scores', { score, level_reached: level }),
  myScores:    ()             => API.request('GET',    '/api/scores/me'),
  leaderboard: ()             => API.request('GET',    '/api/scores/leaderboard'),
  deleteScore: (id)           => API.request('DELETE', `/api/scores/${id}`),
};
