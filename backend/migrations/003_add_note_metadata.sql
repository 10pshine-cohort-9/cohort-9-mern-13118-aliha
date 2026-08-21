-- migration: non-transactional
ALTER TABLE notes
    ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS category VARCHAR(100),
    ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT FALSE;

-- These drops also remove same-named invalid indexes left by an interrupted
-- CREATE INDEX CONCURRENTLY. The migration runner executes this file outside a transaction.
DROP INDEX CONCURRENTLY IF EXISTS idx_notes_user_pinned_updated;
DROP INDEX CONCURRENTLY IF EXISTS idx_notes_user_category;

CREATE INDEX CONCURRENTLY idx_notes_user_pinned_updated
    ON notes (user_id, is_pinned DESC, updated_at DESC);

CREATE INDEX CONCURRENTLY idx_notes_user_category
    ON notes (user_id, category);