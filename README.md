# devops-softwarica

## Natak Full-Stack App

`sites/natak` contains the Vite + React frontend, and `sites/natak-backend` contains the Express API.

### Local run with Docker

```bash
cp .env.example .env
docker compose up --build
```

Open `http://localhost:8080`.

### Local run without Docker

```bash
cp sites/natak/.env.example sites/natak/.env
cp sites/natak-backend/.env.example sites/natak-backend/.env
cd sites/natak-backend && npm install && npm run dev
cd sites/natak && npm install && npm run dev
```

Open the Vite app on `http://localhost:5173`.

### Deployment flow

The GitHub Actions workflow in [.github/workflows/deploy.yaml](/Users/sambandharai/Downloads/devops-softwarica/.github/workflows/deploy.yaml:1) does this:

1. Runs Semgrep and Trivy scans.
2. Builds Docker images for the frontend and backend.
3. Pushes both images to Docker Hub.
4. Copies [docker-compose.prod.yml](/Users/sambandharai/Downloads/devops-softwarica/docker-compose.prod.yml:1) to the server.
5. Runs `docker compose pull` and `docker compose up -d` on the server.

After deployment, open:

```text
http://SERVER_IP:PORT
```

Example:

```text
http://203.0.113.10:80
```

### Required GitHub Secrets

Add these repository secrets before running the deploy workflow:

- `SAMBANDHA_DOCKER_USERNAME`
- `NATAK_DOCKERHUB_TOKEN`
- `SAMBANDHA_SERVER_HOST`
- `SAMBANDHA_SERVER_USERNAME`
- `SAMBANDHA_SSH_KEY`
- `NATAK_FRONTEND_PORT`
- `NATAK_BACKEND_PORT`
- `NATAK_CORS_ORIGIN`

### Server requirement

The target server only needs:

- Docker installed
- Docker Compose available as `docker compose`
- SSH access from GitHub Actions
