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

## Notes — implemented (Sprint 2)

All routes below require `Authorization: Bearer <token>` and are always
scoped to the authenticated user (`req.user.id`) — one user can never
read, edit, or delete another user's note. Every note-specific query is
written as `WHERE id = :id AND user_id = :currentUser` together, so a
mismatched note simply doesn't match the query — there's no separate
"check ownership" step to forget.

### `GET /api/notes`
Returns all notes owned by the caller, newest-updated first.

Success — `200 OK`:
```json
{ "status": "success", "data": { "notes": [ { "id": 1, "user_id": 1, "title": "...", "content": {...}, "created_at": "...", "updated_at": "..." } ] } }
```

### `POST /api/notes`
Request:
```json
{ "title": "Grocery list", "content": { "ops": [{ "insert": "Milk, eggs, bread\n" }] } }
```
Success — `201 Created`: `{ "status": "success", "data": { "note": {...} } }`

Errors: `400` if `title` is missing/empty/over 200 chars, or `content` is
missing or not a JSON object.

### `GET /api/notes/:id`
Success — `200 OK`: `{ "status": "success", "data": { "note": {...} } }`

Errors:
| Status | Cause |
|---|---|
| 400 | `:id` isn't a positive integer |
| 404 | Note doesn't exist, **or exists but belongs to another user** — identical response either way, never confirms a note ID is "real but not yours" |

### `PUT /api/notes/:id`
Request — either or both fields:
```json
{ "title": "Updated title" }
```
A partial update (only `title`, or only `content`) preserves the other
field's existing value rather than nulling it out.

Success — `200 OK`: `{ "status": "success", "data": { "note": {...} } }`

Errors: same `400`/`404` semantics as `GET /api/notes/:id`, plus `400` if
neither `title` nor `content` is provided, or a provided field fails
validation.

### `DELETE /api/notes/:id`
Success — `204 No Content` (empty body).

Errors: same `400`/`404` semantics as `GET /api/notes/:id`.

## Users — planned / optional (Sprint 3, Profile screen)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/me` | Current authenticated user's profile |
