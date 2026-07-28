const pool = require('../config/db');

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
 * Returns the updated row, or null if no note matched (either it doesn't
 * exist, or it exists but isn't owned by userId — the query can't tell
 * the difference, which is exactly the point).
 */
async function updateForUser(id, userId, { title, content }) {
  const { rows } = await pool.query(
    `UPDATE notes
        SET title = $1,
            content = $2
      WHERE id = $3 AND user_id = $4
     RETURNING id, user_id, title, content, created_at, updated_at`,
    [title, content, id, userId],
  );
  return rows[0] || null;
}

/**
 * Returns true if a row was actually deleted, false if nothing matched.
 */
async function deleteForUser(id, userId) {
  const { rowCount } = await pool.query('DELETE FROM notes WHERE id = $1 AND user_id = $2', [
    id,
    userId,
  ]);
  return rowCount > 0;
}

module.exports = { findAllByUserId, findByIdForUser, create, updateForUser, deleteForUser };
