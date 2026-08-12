// middleware/errorHandler.js
// ONE place to handle ALL errors — controllers just throw and this catches them
const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  // Already a known ApiError
  if (err.name === 'ApiError') {
    return res.status(err.statusCode).json({ success: false, error: err.message });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, error: 'Invalid token.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, error: 'Token expired. Please login again.' });
  }

  // PostgreSQL errors
  if (err.code === '23505') { // unique_violation
    return res.status(409).json({ success: false, error: 'A record with this value already exists.' });
  }
  if (err.code === '23503') { // foreign_key_violation
    return res.status(400).json({ success: false, error: 'Referenced record does not exist.' });
  }
  if (err.code === '23502') { // not_null_violation
    return res.status(400).json({ success: false, error: `Field "${err.column}" is required.` });
  }
  if (err.code === '22P02') { // invalid_text_representation (bad UUID etc.)
    return res.status(400).json({ success: false, error: 'Invalid ID format.' });
  }

  // Malformed JSON body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, error: 'Invalid JSON in request body.' });
  }

  // Multer (file upload) errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ success: false, error: 'File is too large. Maximum size is 20MB.' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(415).json({ success: false, error: 'Unsupported file type. Please upload a PDF, JPG, or PNG.' });
    }
    return res.status(400).json({ success: false, error: err.message || 'File upload error.' });
  }

  // Unexpected error — log it but don't expose details to client
  console.error('Unhandled error:', err);
  return res.status(500).json({ success: false, error: 'Internal server error.' });
};

// 404 handler — triggered when no route matches
const notFoundHandler = (req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.originalUrl} not found.` });
};

module.exports = { errorHandler, notFoundHandler };
