// routes/chatRoutes.js
const express = require('express');
const router  = express.Router();

const {
  sendMessage,
  getChatHistory,
  sendGeneralMessage,
  getGeneralChatHistory,
  listSessions,
  getSessionHistory,
} = require('../controllers/chatController');
const { requireAuth } = require('../middleware/auth');
const { chatMessageRules, reportIdParamRules, generalChatMessageRules, validate } = require('../middleware/validators');

router.use(requireAuth);

// GET  /api/chat/sessions            — list all saved chat threads (most recent first)
// GET  /api/chat/sessions/:sessionId — full messages for one saved thread
// NOTE: registered early so "sessions" isn't swallowed as a reportId param
router.get('/sessions', listSessions);
router.get('/sessions/:sessionId', getSessionHistory);

// POST /api/chat/general            — general health Q&A, no report selected
// GET  /api/chat/general/history    — fetch saved general chat history
// NOTE: also registered before /:reportId for the same reason
router.post('/general', generalChatMessageRules, validate, sendGeneralMessage);
router.get('/general/history', getGeneralChatHistory);

// POST /api/chat/:reportId          — send a message about a report
router.post('/:reportId', chatMessageRules, validate, sendMessage);

// GET  /api/chat/:reportId/history  — get full conversation history
router.get('/:reportId/history', reportIdParamRules, validate, getChatHistory);

module.exports = router;
