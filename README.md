# Note-Taking Web Application (Full-Stack)

Secure, multi-tenant note-taking application. Authenticated users can create,
edit, view, and delete personal notes, strictly scoped to their own account.

**Engagement:** 4-week, 4-sprint Agile-Scrum delivery, ending in a tagged
`v1.0.0` release on `main`.

## Stack

| Layer              | Technology              |
|--------------------|--------------------------|
| Frontend           | React.js (Vite)          |
| Frontend Testing   | Jest + Testing Library   |
| Backend            | Node.js (Express)        |
| Backend Testing    | Mocha / Chai             |
| Database           | PostgreSQL               |
| Logging            | Pino                     |
| Code Quality       | SonarQube                |
| Version Control    | Git / GitHub (`10pShine` branching strategy) |

## Repository layout

```
/backend    Express REST API (controllers -> services -> data-access)
/frontend   React SPA
```

## Local development

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run migrate      # applies pending migrations
npm run dev           # http://localhost:4000
npm test              # Mocha/Chai
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev            # http://localhost:5173
npm test               # Jest
```

## Branching strategy (`10pShine`)

- `main` — production-ready code only.
- `develop` — integration branch; all feature/bugfix work merges here.
- `feature/frontend/<name>` / `feature/backend/<name>` — new features.
- `bugfix/frontend/<desc>` / `bugfix/backend/<desc>` — bug fixes.

```bash
git checkout develop
git pull origin develop
git checkout -b feature/backend/<feature-name>
# ...work, commit frequently...
git push origin feature/backend/<feature-name>
# open a PR into develop; at least one peer review required before merge
```

## Sprint plan (4 weeks)

| Sprint | Focus |
|--------|-------|
| 1 | Repo/DB setup, backend auth (JWT/BCrypt), logging, error middleware |
| 2 | Notes CRUD API, service/DAL separation, Mocha/Chai coverage, SonarQube |
| 3 | React scaffold, auth screens, Dashboard, Note Editor, Jest coverage, integration |
| 4 | Hardening, regression, final SonarQube pass, UAT, `v1.0.0` tag |

## Docs

| File | Covers |
|---|---|
| [`docs/er-diagram.md`](docs/er-diagram.md) | Users/Notes ER diagram (Mermaid) |
| [`docs/api-contract.md`](docs/api-contract.md) | Full REST API contract — auth (built), notes (Sprint 2), users (optional) |
| [`docs/wireframes/index.html`](docs/wireframes/index.html) | Low-fidelity wireframes for the 4 STS screens |
| [`docs/BRANCH_PROTECTION.md`](docs/BRANCH_PROTECTION.md) | Branch protection rules for `main`/`develop` + a `gh` CLI script to apply them |

## CodeRabbit review response (Sprint 1 PR)

21 findings across 3 severity tiers. 19 fixed outright; 2 addressed with a
deliberate, lighter-touch call explained below rather than full compliance.

**High severity — all fixed:**
- Signup race condition: PG's `23505` unique-violation is now caught and
  mapped to the existing 409, closing the gap between the `findByEmail`
  pre-check and the actual `INSERT`
- App now fails fast (nonzero exit) on missing `DATABASE_URL`/`JWT_SECRET`,
  the literal `.env.example` placeholder secret, or a secret under 32 chars
- CORS restricted to an explicit allow-list (`CORS_ORIGINS` env var)
  instead of the wide-open default
- Postgres bound to `127.0.0.1` only; credentials moved out of
  `docker-compose.yml` into an untracked root `.env` (see `.env.example`)
- CI workflow: `permissions: contents: read` + `persist-credentials: false`
- **Bearer-token-in-localStorage** — documented as an accepted trade-off
  (see the comment in `frontend/src/services/apiClient.js`) rather than
  rewritten to HttpOnly cookies. The full fix is a real architecture change
  (CSRF handling, `Set-Cookie`, `credentials: 'include'` CORS) that doesn't
  fit a scaffold where Sprint 3's frontend auth flow doesn't exist yet —
  revisit before this app handles anything more sensitive than personal
  notes, or before any real deployment.

**Medium severity — all fixed:** migration runner now reuses
`src/config/env.js` instead of reading `process.env` separately; DB port
kept aligned between `.env.example` and `docker-compose.yml`; 404 responses
no longer echo query-string values; graceful shutdown now force-exits after
a 10s bound instead of hanging indefinitely; `err.details` excluded from
logs (no fixed shape, so static redact paths can't cover it reliably);
`.gitignore` now covers all `.env*` variants.

**Low severity:**
- Fixed: removed Mocha's `--exit` (added a proper `pool.end()` teardown
  instead, so a real leaked handle would now surface instead of being
  masked); validation errors preserved as structured `details` instead of
  joined into one string; `AppError` now validates its status code range;
  `/health` documented explicitly as liveness-only; frontend CI now runs
  `lint`; `eslint-plugin-react`/`-react-hooks` added; lint script now
  covers `.jsx`.
- **`react/prop-types` left off** in `frontend/.eslintrc.cjs` — deliberate,
  not missed. This project isn't using PropTypes or TypeScript for prop
  validation; if the component tree grows complex enough for that to
  matter, TypeScript is the better fix, not retrofitting PropTypes onto a
  4-sprint scope.
- **Skipped:** wrapping `health.test.js`'s assertions for extra failure
  context. Chai-http talks directly to the in-process Express app (no real
  network hop), so a rejected request here is already an assertion
  failure with a clear Mocha stack trace — the extra wrapping wouldn't add
  diagnostic value for this specific test file.



- ✅ Sprint 1, Task 1 — repo scaffold + PostgreSQL migrations
- ✅ Sprint 1, Task 2 — backend auth API (signup / login / logout)
  - `POST /api/auth/signup` — BCrypt-hashed password, JWT issued on success
  - `POST /api/auth/login` — credential check via `bcrypt.compare`, JWT issued
  - `POST /api/auth/logout` — requires a valid Bearer token (stateless JWT;
    see the `KNOWN LIMITATION` note in `src/controllers/auth.controller.js`
    regarding server-side revocation)
  - 11 Mocha/Chai tests passing (data-access layer stubbed with `sinon`,
    so the suite runs without a live PostgreSQL connection)
- ✅ Sprint 1, Task 3 — remaining Phase 1 deliverables
  - ER diagram, formal API contract document (`docs/`)
  - Wireframes for all 4 STS screens (`docs/wireframes/`)
  - Branch protection rules documented + scripted (`docs/BRANCH_PROTECTION.md`)
  - CI skeleton live (`.github/workflows/ci.yml`) — actual GitHub-side
    branch protection still needs to be applied once the repo is pushed
    (see that doc), since that's a repo-settings action, not code
- ⬜ Sprint 2 — Notes CRUD API, SonarQube integration
- ⬜ Sprint 3 — Frontend auth/dashboard/editor wiring
- ⬜ Sprint 4 — Hardening, UAT, `v1.0.0` tag

**Sprint 1 is now functionally complete.**
