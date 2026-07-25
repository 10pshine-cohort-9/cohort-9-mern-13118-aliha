const pool = require('../config/db');

// Never select password_hash except in findByEmail, which auth.service
// needs for bcrypt.compare. Every other query returns only safe columns.
const SAFE_COLUMNS = 'id, name, email, created_at, updated_at';

async function findByEmail(email) {
  const { rows } = await pool.query(
    `SELECT id, name, email, password_hash, created_at, updated_at
       FROM users
      WHERE email = $1`,
    [email],
  );
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await pool.query(`SELECT ${SAFE_COLUMNS} FROM users WHERE id = $1`, [id]);
  return rows[0] || null;
}

async function createUser({ name, email, passwordHash }) {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING ${SAFE_COLUMNS}`,
    [name, email, passwordHash],
  );
  return rows[0];
}

module.exports = { findByEmail, findById, createUser };
