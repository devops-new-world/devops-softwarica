# React + PostgreSQL Website

A simple full-stack project with a React frontend and a Node.js/Express backend using PostgreSQL.

## Setup

1. Install dependencies:
   - `cd server && npm install`
   - `cd client && npm install`

2. Configure PostgreSQL:
   - Create a database and user
   - Copy `server/.env.example` to `server/.env`
   - Set `DATABASE_URL` with your DB connection string

3. Start services:
   - `cd server && npm run dev`
   - `cd client && npm run dev`

## Docker Setup

1. Build and start the app with Docker Compose:
   - `docker compose up --build`

2. Open these URLs:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:4000/api/items`
   - PostgreSQL: `localhost:5432`

3. Stop the app:
   - `docker compose down`

## Functionality

- React app fetches items from the backend API
- Backend stores items in PostgreSQL
- `docker-compose.yml` launches `db`, `server`, and `client` containers
