// utils/asyncHandler.js
// Wraps async controllers so any thrown error is passed to Express error handler
// This means we don't need try/catch in every controller function
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
