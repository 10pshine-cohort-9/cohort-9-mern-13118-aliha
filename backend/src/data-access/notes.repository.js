const pool = require("../config/db");

/**
 * Every query here that touches a specific note takes BOTH id and userId
 * and puts them together in the WHERE clause — not "find by id, then
 * check ownership in JS afterward". That means a note belonging to
 * another user simply doesn't match the query at all; there's no code
 * path where the wrong note's data ever gets loaded into memory, let
 * alone accidentally returned.
 */

async function findAllByUserId(userId) {
  const { rows } = await pool.query(
    `SELECT id, user_id, title, content, created_at, updated_at
       FROM notes
      WHERE user_id = $1
      ORDER BY updated_at DESC`,
    [userId],
  );
  return rows;
}

async function findByIdForUser(id, userId) {
  const { rows } = await pool.query(
    `SELECT id, user_id, title, content, created_at, updated_at
       FROM notes
      WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );
  return rows[0] || null;
}

async function create({ userId, title, content }) {
  const { rows } = await pool.query(
    `INSERT INTO notes (user_id, title, content)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, title, content, created_at, updated_at`,
    [userId, title, content],
  );
  return rows[0];
}

/**
 * Partial update: only columns actually provided (non-undefined) get
 * overwritten. Deliberately a single atomic UPDATE rather than
 * "read the existing row, merge in JS, write it back" — that read-then-write
 * pattern has a real race: another request could update the note in the
 * gap between this function's read and its write, and this write would
 * silently stomp that concurrent change with now-stale data. COALESCE
 * lets PostgreSQL itself decide what to keep, in one statement, with no
 * such gap. (title/content are validated to never legitimately be `null`
 * when provided, so `null` is a safe "not provided" sentinel here.)
 */
async function updateForUser(id, userId, { title, content }) {
  try {
    const { rows } = await pool.query(
      `UPDATE notes
          SET title = COALESCE($1, title),
              content = COALESCE($2, content)
        WHERE id = $3 AND user_id = $4
       RETURNING id, user_id, title, content, created_at, updated_at`,
      [title ?? null, content ?? null, id, userId],
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

/**
 * Returns true if a row was actually deleted, false if nothing matched.
 */
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
