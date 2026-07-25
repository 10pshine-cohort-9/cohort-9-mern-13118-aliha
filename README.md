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

```text
/backend    Express REST API (controllers -> services -> data-access)
/frontend   React SPA
```

## Local development

### 1. Start PostgreSQL

Postgres credentials are **not** hardcoded in `docker-compose.yml` — copy the
root `.env.example` to `.env` and fill in real values first, or
`docker compose up` will fail with a "variable is not set" error (deliberately
— see the CodeRabbit review response below):

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

Before running anything else, **edit `backend/.env`**:
- `DATABASE_URL` — update the user/password/db to match whatever you set in
  the root `.env` in step 1 (they must agree, or migrations/the API can't
  connect)
- `JWT_SECRET` — replace the placeholder with a real random value of **at
  least 32 characters**. The app refuses to start with the placeholder or
  anything shorter — generate one with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

Then:

```bash
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

21 findings across 3 severity tiers, reviewed in two passes (the second
catching real gaps in the first pass's fixes — noted inline below). 19
implemented as requested; 2 are deliberate, documented exceptions — not
silently skipped, and neither is claimed as "fixed" below.

**High severity:**
- Signup race condition: PG's `23505` unique-violation is now caught and
  mapped to the existing 409, closing the gap between the `findByEmail`
  pre-check and the actual `INSERT`
- App now fails fast (nonzero exit) on missing `DATABASE_URL`/`JWT_SECRET`,
  the literal `.env.example` placeholder secret, or a secret under 32 chars
- CORS restricted to an explicit allow-list (`CORS_ORIGINS` env var)
  instead of the wide-open default
- Postgres bound to `127.0.0.1` only. **First pass was incomplete:**
  credentials were moved into `${VAR:-default}` substitution, but the
  `:-default` fallback meant a known, guessable password was silently used
  if the root `.env` was missing — no better than committing it. Now uses
  `${VAR:?error}`, which makes `docker compose up` fail loudly instead of
  silently falling back.
- CI workflow: `permissions: contents: read` + `persist-credentials: false`

**Medium severity — all fixed:** migration runner now reuses
`src/config/env.js` instead of reading `process.env` separately; DB port
kept aligned between `.env.example` and `docker-compose.yml`; 404 responses
no longer echo query-string values; `err.details` excluded from logs (no
fixed shape, so static redact paths can't cover it reliably); `.gitignore`
now covers all `.env*` variants. Graceful shutdown: **first pass was
incomplete** — it added a bounded force-exit timer but ignored
`server.close()`'s error argument, so a failed close would still report
success. Now checks that argument and exits non-zero on failure.

**Low severity:**
- Fixed: removed Mocha's `--exit` (added a proper `pool.end()` teardown
  instead); validation errors preserved as structured `details` instead of
  joined into one string; `AppError` now validates its status code range;
  `/health` documented explicitly as liveness-only; frontend CI now runs
  `lint`; lint script now covers `.jsx`.
- **`react/prop-types` — first pass disabled it project-wide with a
  rationale comment. Correctly pushed back on: the real fix was cheap
  (exactly one component, `AuthProvider`, takes a prop) and is now in
  place instead** — `prop-types` added as a dependency, `AuthProvider`
  validates `children`, and the ESLint rule is fully enabled again.
- **Deferred, not fixed:** wrapping `health.test.js`'s assertions for
  extra failure context. Chai-http talks directly to the in-process
  Express app (no real network hop), so a rejected request here is
  already an assertion failure with a clear Mocha stack trace — the
  extra wrapping wouldn't add diagnostic value for this specific file.

### Deferred with a real guard, not just a comment: bearer token in `localStorage`

**Not fixed, and not claimed as fixed.** `frontend/src/services/apiClient.js`
stores the JWT in `localStorage`, which an XSS can read and exfiltrate. The
real fix is an HttpOnly/Secure/SameSite cookie session with CSRF
protection — a genuine architecture change (backend `Set-Cookie` handling,
`credentials: 'include'` CORS) that doesn't fit a scaffold where Sprint 3's
frontend auth flow doesn't exist yet.

First pass only documented this in a code comment, which CodeRabbit
correctly called out as not a real compensating control. It now also has
one: `backend/src/config/env.js` **refuses to start with `NODE_ENV=production`**
unless `ACKNOWLEDGE_LOCALSTORAGE_JWT_RISK=true` is explicitly set — so this
can no longer reach a real deployment silently. Must be fixed properly (or
consciously re-acknowledged) before this app is used for anything more
sensitive than course-project notes.

## Status

- ✅ Sprint 1, Task 1 — repo scaffold + PostgreSQL migrations
- ✅ Sprint 1, Task 2 — backend auth API (signup / login / logout)
  - `POST /api/auth/signup` — BCrypt-hashed password, JWT issued on success
  - `POST /api/auth/login` — credential check via `bcrypt.compare`, JWT issued
  - `POST /api/auth/logout` — requires a valid Bearer token (stateless JWT;
    see the `KNOWN LIMITATION` note in `src/controllers/auth.controller.js`
    regarding server-side revocation)
  - 12 Mocha/Chai tests passing (data-access layer stubbed with `sinon`,
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
