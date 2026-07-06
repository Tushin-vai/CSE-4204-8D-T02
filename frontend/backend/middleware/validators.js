// middleware/validators.js
// Input validation rules using express-validator
// If validation fails, returns a 400 with a list of field errors
const { body, param, validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

// Run after validation rules — returns error list if any field failed
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed.',
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ── Auth validators ───────────────────────────────────────────
const registerRules = [
  body('full_name').trim().notEmpty().withMessage('Full name is required.'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter.')
    .matches(/[0-9]/).withMessage('Password must contain at least one number.'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

const refreshRules = [
  body('refresh_token').notEmpty().withMessage('Refresh token is required.'),
];

// ── Profile validators ────────────────────────────────────────
const updateProfileRules = [
  body('full_name').optional().trim().notEmpty().withMessage('Full name cannot be empty.'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required.'),
];

// ── Report validators ─────────────────────────────────────────
const createReportRules = [
  body('file_name').trim().notEmpty().withMessage('File name is required.'),
  body('report_type').optional().trim(),
];

const uuidParamRules = [
  param('id').isUUID().withMessage('Invalid ID format.'),
];

const reportIdParamRules = [
  param('reportId').isUUID().withMessage('Invalid report ID format.'),
];

// ── Chat validators ───────────────────────────────────────────
const chatMessageRules = [
  body('message').trim().notEmpty().withMessage('Message cannot be empty.'),
  param('reportId').isUUID().withMessage('Invalid report ID.'),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  refreshRules,
  updateProfileRules,
  createReportRules,
  uuidParamRules,
  reportIdParamRules,
  chatMessageRules,
};
