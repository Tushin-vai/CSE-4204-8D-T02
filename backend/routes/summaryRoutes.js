// routes/summaryRoutes.js
const express = require('express');
const router  = express.Router();

const { getSummary }  = require('../controllers/summaryController');
const { requireAuth } = require('../middleware/auth');
const { reportIdParamRules, validate } = require('../middleware/validators');

router.use(requireAuth);

// GET /api/summaries/:reportId
router.get('/:reportId', reportIdParamRules, validate, getSummary);

module.exports = router;
