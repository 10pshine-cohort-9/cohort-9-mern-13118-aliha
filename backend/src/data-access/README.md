# Data Access Layer

The only place in the codebase allowed to run SQL against PostgreSQL
(via `../config/db.js`). One repository module per table
(e.g. `users.repository.js`, `notes.repository.js`), returning plain
JS objects up to the service layer.
