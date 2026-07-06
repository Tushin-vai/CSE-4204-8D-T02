// models/reportModel.js
// All database queries for the REPORTS table
const { query } = require('../config/db');

const createReport = async ({ user_id, file_name, file_url, report_type }) => {
  const result = await query(
    `INSERT INTO reports (user_id, file_name, file_url, report_type, status)
     VALUES ($1, $2, $3, $4, 'pending')
     RETURNING *`,
    [user_id, file_name, file_url || null, report_type || 'general']
  );
  return result.rows[0];
};

const findAllByUser = async (user_id) => {
  const result = await query(
    'SELECT * FROM reports WHERE user_id = $1 ORDER BY upload_date DESC',
    [user_id]
  );
  return result.rows;
};

const findById = async (id) => {
  const result = await query('SELECT * FROM reports WHERE id = $1', [id]);
  return result.rows[0] || null;
};

const updateStatus = async (id, status) => {
  const result = await query(
    'UPDATE reports SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  );
  return result.rows[0];
};

const deleteReport = async (id) => {
  await query('DELETE FROM reports WHERE id = $1', [id]);
};

module.exports = { createReport, findAllByUser, findById, updateStatus, deleteReport };
