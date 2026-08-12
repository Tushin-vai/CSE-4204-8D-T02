// middleware/upload.js
// Multer config for report uploads — keeps files in memory (no disk writes),
// since we only need the buffer long enough to extract text from it.
const multer = require('multer');

const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']);
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only PDF, JPG, and PNG files are supported.'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 1 },
});

module.exports = upload;
