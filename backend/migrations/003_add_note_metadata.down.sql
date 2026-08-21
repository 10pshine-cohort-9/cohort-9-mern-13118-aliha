DROP INDEX CONCURRENTLY IF EXISTS idx_notes_user_category;
DROP INDEX CONCURRENTLY IF EXISTS idx_notes_user_pinned_updated;

ALTER TABLE notes
    DROP COLUMN IF EXISTS is_archived,
    DROP COLUMN IF EXISTS is_pinned,
    DROP COLUMN IF EXISTS category,
    DROP COLUMN IF EXISTS tags;