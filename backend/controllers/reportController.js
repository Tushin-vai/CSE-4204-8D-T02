// controllers/reportController.js
// Handles: create report, list reports, get single report, delete report
// After creating a report, it automatically runs AI analysis and saves summary
const asyncHandler  = require('../utils/asyncHandler');
const ApiError      = require('../utils/ApiError');
const reportModel   = require('../models/reportModel');
const summaryModel  = require('../models/summaryModel');
const { analyzeReport } = require('../utils/aiService');
const { extractText } = require('../utils/textExtraction');

// ── POST /api/reports ─────────────────────────────────────────
// Create a report record + immediately run AI analysis on it.
// Supports two input modes:
//   1. multipart/form-data with a `file` field (PDF/JPG/PNG) — text is extracted server-side
//   2. application/json with file_name + report_text (legacy paste-text flow)
const createReport = asyncHandler(async (req, res) => {
  const { file_name: bodyFileName, file_url, report_type, report_text: bodyReportText } = req.body;
  const uploadedFile = req.file; // set by multer when a file is attached

  if (!uploadedFile && !bodyReportText) {
    throw new ApiError(400, 'Please upload a file or provide report_text.');
  }

  let reportText = bodyReportText || '';
  let fileName = bodyFileName;
  let extractionInfo = null;

  // 1. If a file was uploaded, extract its text (PDF text, or OCR for images / scanned PDFs)
  if (uploadedFile) {
    fileName = fileName || uploadedFile.originalname;
    const extracted = await extractText(uploadedFile.buffer, uploadedFile.mimetype);
    reportText = extracted.text;
    extractionInfo = {
      method: extracted.method,
      ocrPagesUsed: extracted.ocrPagesUsed,
      totalPages: extracted.totalPages,
      truncated: extracted.truncated || false,
    };
  }

  if (!fileName) {
    throw new ApiError(400, 'file_name is required when not uploading a file.');
  }

  // 2. Save report record with status 'processing'
  let report = await reportModel.createReport({
    user_id:     req.user.userId,
    file_name:   fileName,
    file_url:    file_url || null,
    report_type: report_type || 'general',
  });

  await reportModel.updateStatus(report.id, 'processing');

  // 3. Run AI analysis on the actual extracted/pasted text
  try {
    const aiResult = await analyzeReport(reportText);

    // 4. Save summary to summaries table
    await summaryModel.createSummary({
      report_id:     report.id,
      summary_text:  aiResult.summary_text,
      key_findings:  aiResult.key_findings,
      abnormal_flags: aiResult.abnormal_flags,
    });

    // 5. Mark report as completed
    report = await reportModel.updateStatus(report.id, 'completed');
  } catch (err) {
    await reportModel.updateStatus(report.id, 'failed');
    console.error('AI analysis failed:', err.message);
  }

  const summary = await summaryModel.findByReportId(report.id);

  res.status(201).json({
    success: true,
    message: 'Report uploaded and analyzed.',
    data: { report, summary, extraction: extractionInfo },
  });
});

// ── GET /api/reports ──────────────────────────────────────────
const listReports = asyncHandler(async (req, res) => {
  const reports = await reportModel.findAllByUser(req.user.userId);
  res.json({ success: true, data: { reports, count: reports.length } });
});

// ── GET /api/reports/:id ──────────────────────────────────────
const getReport = asyncHandler(async (req, res) => {
  const report = await reportModel.findById(req.params.id);
  if (!report) throw new ApiError(404, 'Report not found.');

  // Make sure this report belongs to the logged-in user
  if (report.user_id !== req.user.userId) throw new ApiError(403, 'Access denied.');

  const summary = await summaryModel.findByReportId(report.id);

  res.json({ success: true, data: { report, summary } });
});

// ── DELETE /api/reports/:id ───────────────────────────────────
const deleteReport = asyncHandler(async (req, res) => {
  const report = await reportModel.findById(req.params.id);
  if (!report) throw new ApiError(404, 'Report not found.');
  if (report.user_id !== req.user.userId) throw new ApiError(403, 'Access denied.');

  await reportModel.deleteReport(report.id);
  res.json({ success: true, message: 'Report deleted successfully.' });
});

module.exports = { createReport, listReports, getReport, deleteReport };
