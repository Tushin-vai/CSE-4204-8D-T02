// models/chatModel.js
// All database queries for the CHAT_HISTORY table
const { query } = require('../config/db');

const createMessage = async ({ report_id, user_id, message, response, session_id }) => {
  const result = await query(
    `INSERT INTO chat_history (report_id, user_id, message, response, session_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [report_id, user_id, message, response, session_id || null]
  );
  return result.rows[0];
};

const findByReportId = async (report_id) => {
  const result = await query(
    'SELECT * FROM chat_history WHERE report_id = $1 ORDER BY timestamp ASC',
    [report_id]
  );
  return result.rows;
};

// General chat history — messages with no report attached (report_id IS NULL).
const findGeneralByUserId = async (user_id) => {
  const result = await query(
    'SELECT * FROM chat_history WHERE report_id IS NULL AND user_id = $1 ORDER BY timestamp ASC',
    [user_id]
  );
  return result.rows;
};

// ── Saved chat "threads" (ChatGPT-style sessions) ──────────────
// One row per session_id, showing when it started, when it was last
// active, and the first message as a preview title.
const listSessions = async (user_id) => {
  const result = await query(
    `SELECT
       session_id,
       report_id,
       MIN(timestamp) AS started_at,
       MAX(timestamp) AS last_message_at,
       (ARRAY_AGG(message ORDER BY timestamp ASC))[1] AS preview
     FROM chat_history
     WHERE user_id = $1 AND session_id IS NOT NULL
     GROUP BY session_id, report_id
     ORDER BY last_message_at DESC`,
    [user_id]
  );
  return result.rows;
};

// All messages belonging to one saved session, scoped to the owning user.
const findBySessionId = async (session_id, user_id) => {
  const result = await query(
    'SELECT * FROM chat_history WHERE session_id = $1 AND user_id = $2 ORDER BY timestamp ASC',
    [session_id, user_id]
  );
  return result.rows;
};

module.exports = {
  createMessage,
  findByReportId,
  findGeneralByUserId,
  listSessions,
  findBySessionId,
};
