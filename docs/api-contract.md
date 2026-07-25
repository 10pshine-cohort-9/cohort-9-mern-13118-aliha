# API Contract

Phase 1 deliverable per the STS (Section 7: API Endpoint Design). Every
route beyond `/api/auth/signup` and `/api/auth/login` requires a valid
`Authorization: Bearer <token>` header.

Base URL (local dev): `http://localhost:4000/api`

## Conventions

- All request/response bodies are JSON (`Content-Type: application/json`).
- Every response carries an `X-Request-Id` header; error bodies also embed
  it as `requestId` so a client-reported issue can be traced to exact log
  lines server-side.
- Every error response follows the same shape, regardless of status code:

  ```json
  {
    "status": "error",
    "message": "Human-readable, safe-to-display message",
    "requestId": "a1b2c3d4-..."
  }
  ```

  5xx messages are always the generic `"Internal server error"` — no
  internals are ever leaked to the client. 4xx messages describe the
  actual problem (validation, auth, not found, conflict).
- Every success response follows:

  ```json
  { "status": "success", "data": { ... } }
  ```

---

## Auth — implemented (Sprint 1)

### `POST /api/auth/signup`
**Auth:** Public

Request:
```json
{ "name": "Ada Lovelace", "email": "ada@example.com", "password": "supersecret123" }
```

Success — `201 Created`:
```json
{
  "status": "success",
  "data": {
    "user": { "id": 1, "name": "Ada Lovelace", "email": "ada@example.com", "created_at": "...", "updated_at": "..." },
    "token": "<jwt>"
  }
}
```

Errors:
| Status | Cause |
|---|---|
| 400 | Missing/invalid `name`, `email`, or `password` (password < 8 chars, malformed email, etc.) |
| 409 | Email already registered |

### `POST /api/auth/login`
**Auth:** Public

Request:
```json
{ "email": "ada@example.com", "password": "supersecret123" }
```

Success — `200 OK`: same shape as signup's `data`.

Errors:
| Status | Cause |
|---|---|
| 400 | Missing/malformed `email` or `password` |
| 401 | Unknown email or wrong password (identical message for both — never reveals which emails are registered) |

### `POST /api/auth/logout`
**Auth:** Required

Success — `200 OK`:
```json
{ "status": "success", "data": { "message": "Logged out" } }
```

Errors:
| Status | Cause |
|---|---|
| 401 | Missing/malformed/expired Bearer token |

> Stateless JWT: the server has no session to destroy, so this endpoint
> validates the token but cannot force-revoke it early. See the
> `KNOWN LIMITATION` note in `backend/src/controllers/auth.controller.js`.

---

## Notes — planned (Sprint 2)

All routes below require `Authorization: Bearer <token>` and are always
scoped to the authenticated user (`req.user.id`) — one user can never
read, edit, or delete another user's note.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notes` | List all notes owned by the authenticated user |
| POST | `/api/notes` | Create a new note (`title`, `content`) |
| GET | `/api/notes/:id` | Fetch a single note (owner only — 404 if it exists but isn't yours) |
| PUT | `/api/notes/:id` | Update an existing note (owner only) |
| DELETE | `/api/notes/:id` | Delete a note (owner only) |

Expected note shape:
```json
{
  "id": 1,
  "user_id": 1,
  "title": "Grocery list",
  "content": { "ops": [{ "insert": "Milk, eggs, bread\n" }] },
  "created_at": "...",
  "updated_at": "..."
}
```
(`content` is `JSONB` — shown here as a Quill-style delta; the frontend's
rich-text library choice in Sprint 3 determines the exact shape, but it
is always stored/returned as structured JSON, never a raw HTML string.)

## Users — planned / optional (Sprint 3, Profile screen)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/me` | Current authenticated user's profile |
