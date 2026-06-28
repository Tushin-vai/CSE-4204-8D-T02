// routes/chatRoutes.js
const express = require('express');
const router  = express.Router();

const { sendMessage, getChatHistory } = require('../controllers/chatController');
const { requireAuth } = require('../middleware/auth');
const { chatMessageRules, reportIdParamRules, validate } = require('../middleware/validators');

router.use(requireAuth);

// POST /api/chat/:reportId          — send a message about a report
router.post('/:reportId', chatMessageRules, validate, sendMessage);

// GET  /api/chat/:reportId/history  — get full conversation history
router.get('/:reportId/history', reportIdParamRules, validate, getChatHistory);

module.exports = router;
