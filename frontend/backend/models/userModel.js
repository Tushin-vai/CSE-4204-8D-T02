// models/userModel.js
// All database queries for the USERS table go here
// Controllers call these functions — never write SQL in controllers
const { query } = require('../config/db');

const findByEmail = async (email) => {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
};

const findById = async (id) => {
  const result = await query(
    'SELECT id, email, full_name, created_at, is_verified, role FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
};

const createUser = async ({ email, password_hash, full_name }) => {
  const result = await query(
    `INSERT INTO users (email, password_hash, full_name)
     VALUES ($1, $2, $3)
     RETURNING id, email, full_name, created_at, is_verified, role`,
    [email, password_hash, full_name]
  );
  return result.rows[0];
};

const updateUser = async (id, fields) => {
  // Only update fields that are actually provided
  const allowed = ['full_name', 'email'];
  const updates = [];
  const values  = [];
  let   idx     = 1;

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      updates.push(`${key} = $${idx++}`);
      values.push(fields[key]);
    }
  }

  if (updates.length === 0) return findById(id);

  values.push(id);
  const result = await query(
    `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx}
     RETURNING id, email, full_name, created_at, is_verified, role`,
    values
  );
  return result.rows[0];
};

module.exports = { findByEmail, findById, createUser, updateUser };
