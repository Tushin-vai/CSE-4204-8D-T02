// middleware/auth.js
// Protects routes — checks the JWT token in the Authorization header
const { verifyAccessToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// requireAuth — attach this to any route that needs a logged-in user
const requireAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'No token provided. Please login first.');
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token); // throws if invalid/expired

  req.user = { userId: decoded.userId, role: decoded.role };
  next();
});

// requireRole — use after requireAuth to restrict to specific roles
// Example: router.delete('/users/:id', requireAuth, requireRole('admin'), deleteUser)
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    throw new ApiError(403, 'You do not have permission to perform this action.');
  }
  next();
};

module.exports = { requireAuth, requireRole };
