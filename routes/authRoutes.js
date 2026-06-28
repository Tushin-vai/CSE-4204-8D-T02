// routes/authRoutes.js
const express = require('express');
const router  = express.Router();

const { register, login, refresh, logout } = require('../controllers/authController');
const { registerRules, loginRules, refreshRules, validate } = require('../middleware/validators');

// POST /api/auth/register
router.post('/register', registerRules, validate, register);

// POST /api/auth/login
router.post('/login', loginRules, validate, login);

// POST /api/auth/refresh  — get a new access token using refresh token
router.post('/refresh', refreshRules, validate, refresh);

// POST /api/auth/logout
router.post('/logout', logout);

module.exports = router;
