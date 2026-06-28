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

module.exports = { createMessage, findByReportId };
