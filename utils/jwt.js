// utils/jwt.js
// Generates and verifies JWT access tokens and refresh tokens
const jwt = require('jsonwebtoken');

const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// Access token: short lived (15 min). Sent with every API request.
const generateAccessToken = (userId, role) =>
  jwt.sign({ userId, role }, ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });

// Refresh token: long lived (7 days). Stored in sessions table. Used to get a new access token.
const generateRefreshToken = (userId) =>
  jwt.sign({ userId }, REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });

const verifyAccessToken  = (token) => jwt.verify(token, ACCESS_SECRET);
const verifyRefreshToken = (token) => jwt.verify(token, REFRESH_SECRET);

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
