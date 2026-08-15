const pool = require("../config/db");

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
