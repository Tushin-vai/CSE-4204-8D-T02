// routes/reportRoutes.js
const express = require('express');
const router  = express.Router();

const { createReport, listReports, getReport, deleteReport } = require('../controllers/reportController');
const { requireAuth } = require('../middleware/auth');
const { createReportRules, uuidParamRules, validate } = require('../middleware/validators');
const upload = require('../middleware/upload');

// All report routes require login
router.use(requireAuth);

// POST /api/reports        — upload + analyze a report
// `upload.single('file')` runs first so a multipart file (if any) lands on req.file
// before validation/the controller run. JSON-only (paste-text) requests pass through fine too.
router.post('/', upload.single('file'), createReportRules, validate, createReport);

// GET /api/reports         — list all reports for logged-in user
router.get('/', listReports);

// GET /api/reports/:id     — get one report with its summary
router.get('/:id', uuidParamRules, validate, getReport);

// DELETE /api/reports/:id  — delete a report
router.delete('/:id', uuidParamRules, validate, deleteReport);

module.exports = router;
