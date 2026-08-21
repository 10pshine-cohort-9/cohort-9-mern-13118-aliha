-- migration: non-transactional
ALTER TABLE notes
    ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS category VARCHAR(100),
    ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notes_user_pinned_updated
    ON notes (user_id, is_pinned DESC, updated_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notes_user_category
    ON notes (user_id, category);