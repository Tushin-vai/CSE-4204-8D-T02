// controllers/userController.js
// Handles: get profile, update profile
const asyncHandler = require('../utils/asyncHandler');
const ApiError     = require('../utils/ApiError');
const userModel    = require('../models/userModel');

// ── GET /api/profile ──────────────────────────────────────────
const getProfile = asyncHandler(async (req, res) => {
  const user = await userModel.findById(req.user.userId);
  if (!user) throw new ApiError(404, 'User not found.');

  res.json({ success: true, data: { user } });
});

// ── PUT /api/profile ──────────────────────────────────────────
const updateProfile = asyncHandler(async (req, res) => {
  const { full_name, email } = req.body;

  // If changing email, check it's not already taken by someone else
  if (email) {
    const existing = await userModel.findByEmail(email);
    if (existing && existing.id !== req.user.userId) {
      throw new ApiError(409, 'This email is already in use.');
    }
  }

  const updated = await userModel.updateUser(req.user.userId, { full_name, email });
  res.json({ success: true, message: 'Profile updated.', data: { user: updated } });
});

module.exports = { getProfile, updateProfile };
