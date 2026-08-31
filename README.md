# Notes App

A full-stack note-taking web application that lets users sign up, log in, create rich-text notes, and manage their personal workspace securely. The project is built with a React frontend, an Express API, and a PostgreSQL database running in Docker.

## What the app does

This application is designed for personal note management. Users can:

- create an account and log in securely
- view a dashboard of their saved notes
- create, edit, and delete notes
- add tags and categories to organize notes
- pin important notes and archive others
- use a rich text editor to format content
- manage their profile information
- access protected routes only after authentication

The core idea is a simple but usable personal productivity app: a user signs in, writes notes, groups them with tags/categories, and keeps a structured digital workspace of ideas, tasks, and working notes.

## How the app works

### Frontend

The frontend is built with React and Vite. It uses client-side routing to manage pages like:

- login
- signup
- dashboard
- note editor
- profile

The app checks authentication before allowing access to protected pages. Requests to the backend are sent through an Axios client configured with the API base URL.

### Backend

The backend is an Express API that handles:

- user authentication
- note CRUD operations
- request validation
- JWT-based protected routes
- database access through PostgreSQL
- health checks and error handling

The backend follows a common layered structure:

- controllers: handle request/response logic
- services: implement business logic
- data-access: interact with PostgreSQL
- routes: map URLs to logic
- middleware: auth, request IDs, 404s, and error handling

### Database

The app stores user and note data in PostgreSQL. Docker Compose is used to run the database locally so each contributor can start the project without installing PostgreSQL manually.

## Tech stack

- Frontend: React, Vite, React Router, Axios
- Backend: Node.js, Express
- Database: PostgreSQL
- Authentication: JWT + middleware protection
- Testing: Jest (frontend), Mocha + Chai (backend)
- Logging: Pino
- Code quality: ESLint, SonarQube

## Project structure

```text
.
├── backend/
│   ├── src/
│   ├── tests/
│   ├── migrations/
│   ├── package.json
│   ├── .env.example
│   └── ...
├── frontend/
│   ├── src/
│   ├── tests/
│   ├── package.json
│   ├── .env.example
│   └── ...
├── docker-compose.yml
├── sonar-project.properties
├── README.md
└── ...
```

## Prerequisites

Before starting the project, make sure you have:

- Node.js 18+ or later
- npm
- Docker Desktop or Docker Engine running
- Git

## Environment setup

### 1. Create the root environment file

At the project root, create a `.env` file using the values required by Docker Compose.

```bash
cp .env.example .env
```

If there is no `.env.example` in the root yet, create one with:

```env
POSTGRES_USER=notes_user
POSTGRES_PASSWORD=change_me
POSTGRES_DB=notes_app_db
POSTGRES_PORT=5433
```

Then start PostgreSQL:

```bash
docker compose up -d
```

This starts a local PostgreSQL instance on `127.0.0.1:5433`.

### 2. Configure the backend

Open the backend folder and create the backend environment file:

```bash
cd backend
cp .env.example .env
```

The backend `.env` file should look similar to this:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://notes_user:change_me@127.0.0.1:5433/notes_app_db
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=1h
LOG_LEVEL=info
```

Important notes:

- `DATABASE_URL` must match the PostgreSQL user, password, and database created in the root `.env`
- `JWT_SECRET` should be a secure random string
- Keep the backend and Docker environment values aligned

### 3. Configure the frontend

In the frontend folder, create the frontend environment file:

```bash
cd frontend
cp .env.example .env
```

The default frontend environment file is:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

This tells the frontend where the API lives.

## Install dependencies

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

## Run the app

### Start the database

From the project root:

```bash
docker compose up -d
```

### Run backend

```bash
cd backend
npm run migrate
npm run dev
```

The backend runs on:

```text
http://localhost:4000
```

### Run frontend

```bash
cd frontend
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

## Health check

The API exposes a health endpoint:

```text
http://localhost:4000/api/health
```

This returns a JSON status response used to confirm the backend is up.

## Authentication and app flow

The application uses JWT-based authentication.

1. A user signs up or logs in from the frontend.
2. The backend verifies credentials and returns a token.
3. Authenticated requests include the token and protected middleware checks access.
4. Access to note routes and profile pages is restricted unless the user is valid.
5. The frontend uses guarded routes to redirect unauthenticated users to the login page.

## Notes feature set

The note system supports:

- list all notes for the current user
- create a new note
- read a single note
- update note content and metadata
- delete note records
- filter by persisted values such as tags and category
- mark notes as pinned or archived

The backend service layer normalizes and validates note data before saving it to the database.

## API overview

The backend exposes these main routes:

```text
GET    /api/health
POST   /api/auth/signup
POST   /api/auth/login
GET    /api/notes
POST   /api/notes
GET    /api/notes/:id
PATCH  /api/notes/:id
DELETE /api/notes/:id
```

All note routes are protected by authentication middleware.

## Database migrations

The backend includes migration scripts for setting up and updating the database schema.

Apply migrations:

```bash
cd backend
npm run migrate
```

Revert the last migration:

```bash
cd backend
npm run migrate:down
```

## Testing and quality checks

Run backend tests:

```bash
cd backend
npm test
```

Run backend coverage:

```bash
cd backend
npm run test:coverage
```

Run backend linting:

```bash
cd backend
npm run lint
```

Run frontend tests:

```bash
cd frontend
npm test
```

Run frontend coverage:

```bash
cd frontend
npm run test:coverage
```

Run frontend linting:

```bash
cd frontend
npm run lint
```

Run a frontend production build:

```bash
cd frontend
npm run build
```

## Why this architecture

The project separates concerns cleanly:

- React handles user experience and viewing/editing workflows
- Express exposes a clear API for the app
- PostgreSQL keeps persistent data safe and queryable
- Docker isolates the database environment and simplifies local setup
- JWTs protect user-specific content and routes

This makes the app easier to extend with features like search, sharing, folders, or collaboration later on.

## Development notes

- Keep `.env` files out of version control in production environments
- If you change Docker ports or database credentials, update the matching values in the backend `.env`
- Before starting the app, always confirm PostgreSQL is running and the `DATABASE_URL` matches the container settings

## Branching strategy

This project follows a typical Git flow pattern:

```text
main
  └── develop
        └── feature/<area>/<name>
        └── bugfix/<area>/<name>
```

## Summary

This project is a personal notes application built as a practical full-stack web app. It demonstrates modern frontend and backend patterns, JWT authentication, protected API routes, and a PostgreSQL-backed data model. The README above is intended to help developers understand the app quickly and get the project running locally without confusion.
