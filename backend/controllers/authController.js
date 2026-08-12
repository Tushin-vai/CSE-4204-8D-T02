// controllers/authController.js
// Handles: register, login, refresh token, logout
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const asyncHandler = require('../utils/asyncHandler');
const ApiError     = require('../utils/ApiError');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt');

const userModel    = require('../models/userModel');
const sessionModel = require('../models/sessionModel');

// ── POST /api/auth/register ───────────────────────────────────
const register = asyncHandler(async (req, res) => {
  const { full_name, email, password } = req.body;

  // Check if email already taken
  const existing = await userModel.findByEmail(email);
  if (existing) throw new ApiError(409, 'An account with this email already exists.');

  // Hash the password (12 rounds = secure but not too slow)
  const password_hash = await bcrypt.hash(password, 12);

  const user = await userModel.createUser({ email, password_hash, full_name });

  res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    data: { user },
  });
});

// ── POST /api/auth/login ──────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findByEmail(email);
  if (!user) throw new ApiError(401, 'Invalid email or password.');

  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) throw new ApiError(401, 'Invalid email or password.');

  // Generate tokens
  const accessToken  = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  // Save refresh token in sessions table
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await sessionModel.createSession({
    user_id:       user.id,
    refresh_token: refreshToken,
    expires_at:    expiresAt,
  });

  res.json({
    success: true,
    message: 'Login successful.',
    data: {
      access_token:  accessToken,
      refresh_token: refreshToken,
      user: {
        id:         user.id,
        email:      user.email,
        full_name:  user.full_name,
        role:       user.role,
      },
    },
  });
});

// ── POST /api/auth/refresh ────────────────────────────────────
const refresh = asyncHandler(async (req, res) => {
  const { refresh_token } = req.body;

  // Verify the token signature
  let decoded;
  try {
    decoded = verifyRefreshToken(refresh_token);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token.');
  }

  // Check it exists in DB (not logged out)
  const session = await sessionModel.findByRefreshToken(refresh_token);
  if (!session) throw new ApiError(401, 'Session not found. Please login again.');

  const user = await userModel.findById(decoded.userId);
  if (!user)   throw new ApiError(401, 'User no longer exists.');

  const newAccessToken = generateAccessToken(user.id, user.role);

  res.json({
    success: true,
    data: { access_token: newAccessToken },
  });
});

// ── POST /api/auth/logout ─────────────────────────────────────
const logout = asyncHandler(async (req, res) => {
  const { refresh_token } = req.body;

  if (refresh_token) {
    await sessionModel.deleteByRefreshToken(refresh_token);
  }

  res.json({ success: true, message: 'Logged out successfully.' });
});

module.exports = { register, login, refresh, logout };
