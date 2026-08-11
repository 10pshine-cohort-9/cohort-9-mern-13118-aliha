# Note-Taking Web Application

Multi-tenant note-taking app — authenticated users can create, edit, view,
and delete their own notes.

## Stack

- Frontend: React (Vite), Jest
- Backend: Node/Express, Mocha/Chai
- Database: PostgreSQL
- Logging: Pino
- Code quality: ESLint, SonarQube

## Project layout

```
/backend    Express REST API (controllers -> services -> data-access)
/frontend   React SPA
```

## Setup

### 1. PostgreSQL

```bash
cp .env.example .env
# edit .env: set POSTGRES_USER / POSTGRES_PASSWORD / POSTGRES_DB
docker compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
```
Edit `backend/.env`:
- `DATABASE_URL` — match the credentials from the root `.env`
- `JWT_SECRET` — generate one: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

```bash
npm install
npm run migrate
npm run dev      # http://localhost:4000
npm test
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev      # http://localhost:5173
npm test
```

## Branching

`main` (production) ← `develop` (integration) ← `feature/frontend|backend/<name>`
or `bugfix/frontend|backend/<name>`.

## Docs

- [`docs/er-diagram.md`](docs/er-diagram.md) — database schema
- [`docs/api-contract.md`](docs/api-contract.md) — API endpoints
- [`docs/SONARQUBE_SETUP.md`](docs/SONARQUBE_SETUP.md) — local SonarQube setup
