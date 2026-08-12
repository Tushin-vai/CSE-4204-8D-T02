// models/summaryModel.js
// All database queries for the SUMMARIES table (1:1 with reports)
const { query } = require('../config/db');

const createSummary = async ({ report_id, summary_text, key_findings, abnormal_flags }) => {
  const result = await query(
    `INSERT INTO summaries (report_id, summary_text, key_findings, abnormal_flags)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (report_id) DO UPDATE
       SET summary_text   = EXCLUDED.summary_text,
           key_findings   = EXCLUDED.key_findings,
           abnormal_flags = EXCLUDED.abnormal_flags,
           generated_at   = NOW()
     RETURNING *`,
    [report_id, summary_text, JSON.stringify(key_findings), JSON.stringify(abnormal_flags)]
  );
  return result.rows[0];
};

const findByReportId = async (report_id) => {
  const result = await query('SELECT * FROM summaries WHERE report_id = $1', [report_id]);
  return result.rows[0] || null;
};

module.exports = { createSummary, findByReportId };
