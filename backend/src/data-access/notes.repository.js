const pool = require("../config/db");

async function findAllByUserId(
  userId,
  { search, tag, category, archived = false } = {},
) {
  try {
    const { rows } = await pool.query(
      `SELECT id, user_id, title, content, created_at, updated_at,
              tags, category, is_pinned, is_archived
         FROM notes
        WHERE user_id = $1
          AND is_archived = $2
          AND ($3::text IS NULL OR title ILIKE '%' || $3 || '%' OR content::text ILIKE '%' || $3 || '%')
          AND ($4::text IS NULL OR $4 = ANY(tags))
          AND ($5::text IS NULL OR category = $5)
        ORDER BY is_pinned DESC, updated_at DESC`,
      [userId, archived, search || null, tag || null, category || null],
    );
    return rows;
  } catch (err) {
    throw wrapRepositoryError(`list notes for userId=${userId}`, err);
  }
}

async function findByIdForUser(id, userId) {
  try {
    const { rows } = await pool.query(
      `SELECT id, user_id, title, content, created_at, updated_at,
            tags, category, is_pinned, is_archived
         FROM notes
        WHERE id = $1 AND user_id = $2`,
      [id, userId],
    );
    return rows[0] || null;
  } catch (err) {
    throw wrapRepositoryError(
      `find note for noteId=${id}, userId=${userId}`,
      err,
    );
  }
}

async function create({
  userId,
  title,
  content,
  tags,
  category,
  is_pinned,
  is_archived,
}) {
  try {
    const { rows } = await pool.query(
      `INSERT INTO notes (user_id, title, content, tags, category, is_pinned, is_archived)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, FALSE), COALESCE($7, FALSE))
       RETURNING id, user_id, title, content, created_at, updated_at,
                 tags, category, is_pinned, is_archived`,
      [userId, title, content, tags, category, is_pinned, is_archived],
    );
    return rows[0];
  } catch (err) {
    throw wrapRepositoryError(`create note for userId=${userId}`, err);
  }
}

async function updateForUser(
  id,
  userId,
  { title, content, tags, category, categoryProvided, is_pinned, is_archived },
) {
  try {
    const { rows } = await pool.query(
      `UPDATE notes
          SET title = COALESCE($1, title),
              content = COALESCE($2, content),
              tags = COALESCE($3, tags),
              category = ${categoryProvided ? " $4" : " COALESCE($4, category)"},
              is_pinned = COALESCE($5, is_pinned),
              is_archived = COALESCE($6, is_archived)
        WHERE id = $7 AND user_id = $8
       RETURNING id, user_id, title, content, created_at, updated_at,
                 tags, category, is_pinned, is_archived`,
      [
        title ?? null,
        content ?? null,
        tags ?? null,
        category ?? null,
        is_pinned ?? null,
        is_archived ?? null,
        id,
        userId,
      ],
    );
    return rows[0] || null;
  } catch (err) {
    const wrappedError = new Error(
      `Failed to update note for noteId=${id}, userId=${userId}: ${err.message}`,
    );
    wrappedError.cause = err;
    throw wrappedError;
  }
}
async function deleteForUser(id, userId) {
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM notes WHERE id = $1 AND user_id = $2",
      [id, userId],
    );
    return rowCount > 0;
  } catch (err) {
    const wrappedError = new Error(
      `Failed to delete note for noteId=${id}, userId=${userId}: ${err.message}`,
    );
    wrappedError.cause = err;
    throw wrappedError;
  }
}

module.exports = {
  findAllByUserId,
  findByIdForUser,
  create,
  updateForUser,
  deleteForUser,
};

function wrapRepositoryError(operation, err) {
  const wrappedError = new Error(`Failed to ${operation}: ${err.message}`);
  wrappedError.cause = err;
  return wrappedError;
}
