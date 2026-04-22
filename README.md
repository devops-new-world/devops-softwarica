# 🎮 Simon Says — Arcade Edition

A full-stack Simon Game with user authentication, leaderboard, and full CRUD functionality.

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Backend    | Node.js + Express                   |
| Database   | sql.js (SQLite, pure JS, zero deps) |
| Auth       | bcryptjs + JWT (httpOnly cookies)   |
| Frontend   | Vanilla JS + CSS                    |
| Proxy      | Nginx                               |
| Container  | Docker + Docker Compose             |

---

## Features

### Auth (CRUD on Users)
- `POST /api/auth/register` — Create account
- `POST /api/auth/login`    — Login
- `POST /api/auth/logout`   — Logout
- `GET  /api/auth/me`       — Read profile
- `PUT  /api/auth/me`       — Update username / email / password
- `DELETE /api/auth/me`     — Delete account + all scores

### Scores (CRUD on Game Data)
- `POST   /api/scores`            — Save a score after game over
- `GET    /api/scores/me`         — Read my scores
- `GET    /api/scores/leaderboard`— Global top 10
- `GET    /api/scores/:id`        — Read a single score
- `PUT    /api/scores/:id`        — Update a score entry
- `DELETE /api/scores/:id`        — Delete a score entry

---

## Project Structure

```
simon-game/
├── src/
│   ├── server.js            # Express entry point
│   ├── db/
│   │   └── database.js      # sql.js wrapper + persistence
│   ├── middleware/
│   │   └── auth.js          # JWT middleware + signToken
│   └── routes/
│       ├── auth.js          # Auth routes
│       └── scores.js        # Scores CRUD routes
├── public/
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── api.js           # Fetch wrapper for all API calls
│       ├── game.js          # Simon game engine + audio
│       └── app.js           # UI controller / routing
├── data/                    # SQLite DB lives here (auto-created)
├── Dockerfile
├── docker-compose.yml
└── nginx.conf
```

---

## Running Locally (without Docker)

```bash
# Install dependencies
npm install

# Start server
npm start
# → http://localhost:3000
```

---

## Running with Docker + Nginx

### 1. Build and start

```bash
docker compose up --build -d
```

The app will be available at `http://localhost` (port 80 via Nginx).

### 2. Set a real JWT secret (recommended for production)

Create a `.env` file next to `docker-compose.yml`:

```env
JWT_SECRET=your-super-secret-key-here
```

Then restart:

```bash
docker compose up -d
```

### 3. View logs

```bash
docker compose logs -f app
docker compose logs -f nginx
```

### 4. Stop

```bash
docker compose down
```

---

## Deploying on a Server with Nginx

If you're deploying to a VPS and already have Nginx installed on the host (not in Docker), you can run just the app container and point your host Nginx at it.

### Option A — Docker Compose (recommended)
Use `docker compose up -d` as above. Nginx is included in the compose stack.

### Option B — Host Nginx as reverse proxy

1. Run only the app:

```bash
docker build -t simon-game .
docker run -d --name simon -p 3000:3000 -v simon_data:/app/data simon-game
```

2. Add this to your host Nginx config (`/etc/nginx/sites-available/simon`):

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/simon /etc/nginx/sites-enabled/
sudo nginx -t && sudo nginx -s reload
```

### Adding HTTPS (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## Database

The SQLite database is stored at `/app/data/simon.db` inside the container.

The `simon_data` Docker volume ensures data persists across container restarts and rebuilds.

To back up the database:

```bash
docker cp simon-game-app-1:/app/data/simon.db ./backup.db
```

---

## Environment Variables

| Variable     | Default                          | Description              |
|--------------|----------------------------------|--------------------------|
| `PORT`       | `3000`                           | Server port              |
| `JWT_SECRET` | `change-me-in-production-please` | JWT signing secret       |
| `NODE_ENV`   | `development`                    | Node environment         |
