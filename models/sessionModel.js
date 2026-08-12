// models/sessionModel.js
// All database queries for the SESSIONS table
const { query } = require('../config/db');

const createSession = async ({ user_id, refresh_token, expires_at }) => {
  const result = await query(
    `INSERT INTO sessions (user_id, refresh_token, expires_at)
     VALUES ($1, $2, $3) RETURNING *`,
    [user_id, refresh_token, expires_at]
  );
  return result.rows[0];
};

const findByRefreshToken = async (refresh_token) => {
  const result = await query(
    'SELECT * FROM sessions WHERE refresh_token = $1 AND expires_at > NOW()',
    [refresh_token]
  );
  return result.rows[0] || null;
};

const deleteByRefreshToken = async (refresh_token) => {
  await query('DELETE FROM sessions WHERE refresh_token = $1', [refresh_token]);
};

const deleteAllByUserId = async (user_id) => {
  await query('DELETE FROM sessions WHERE user_id = $1', [user_id]);
};

module.exports = { createSession, findByRefreshToken, deleteByRefreshToken, deleteAllByUserId };
