// routes/userRoutes.js
const express = require('express');
const router  = express.Router();

const { getProfile, updateProfile } = require('../controllers/userController');
const { requireAuth }               = require('../middleware/auth');
const { updateProfileRules, validate } = require('../middleware/validators');

// All profile routes require login
router.use(requireAuth);

// GET /api/profile
router.get('/', getProfile);

// PUT /api/profile
router.put('/', updateProfileRules, validate, updateProfile);

module.exports = router;
