# Controllers

Thin HTTP layer: parse/validate `req`, call the relevant service, shape
the `res`. No SQL and no business rules here — that belongs in
`../services/` and `../data-access/` respectively.

Currently: `auth.controller.js` (Sprint 1) and `notes.controller.js`
(Sprint 2).
