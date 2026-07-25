# Controllers

Thin HTTP layer: parse/validate `req`, call the relevant service, shape
the `res`. No SQL and no business rules here — that belongs in
`../services/` and `../data-access/` respectively.

Populated starting with the next Sprint 1 task (auth controllers), then
Sprint 2 (notes controllers).
