// controllers/summaryController.js
// Handles: get summary for a report
const asyncHandler   = require('../utils/asyncHandler');
const ApiError       = require('../utils/ApiError');
const summaryModel   = require('../models/summaryModel');
const reportModel    = require('../models/reportModel');

// ── GET /api/summaries/:reportId ──────────────────────────────
const getSummary = asyncHandler(async (req, res) => {
  const report = await reportModel.findById(req.params.reportId);
  if (!report) throw new ApiError(404, 'Report not found.');
  if (report.user_id !== req.user.userId) throw new ApiError(403, 'Access denied.');

  const summary = await summaryModel.findByReportId(req.params.reportId);
  if (!summary) throw new ApiError(404, 'Summary not yet available for this report.');

  res.json({ success: true, data: { summary } });
});

module.exports = { getSummary };
