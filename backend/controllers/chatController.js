// controllers/chatController.js
// Handles: send a message about a report, get chat history, general chat,
// and saved chat "sessions" (ChatGPT-style separate conversation threads).
const asyncHandler        = require('../utils/asyncHandler');
const ApiError            = require('../utils/ApiError');
const chatModel           = require('../models/chatModel');
const reportModel         = require('../models/reportModel');
const summaryModel        = require('../models/summaryModel');
const { chatWithReport }  = require('../utils/aiService');

// ── POST /api/chat/:reportId ──────────────────────────────────
const sendMessage = asyncHandler(async (req, res) => {
  const { message, session_id } = req.body;
  const { reportId } = req.params;

  const report = await reportModel.findById(reportId);
  if (!report) throw new ApiError(404, 'Report not found.');
  if (report.user_id !== req.user.userId) throw new ApiError(403, 'Access denied.');

  const summary = await summaryModel.findByReportId(reportId);
  const context = summary
    ? `Report: ${report.file_name}. Summary: ${summary.summary_text}`
    : `Report: ${report.file_name}`;

  const aiResponse = await chatWithReport(message, context);

  const chat = await chatModel.createMessage({
    report_id:  reportId,
    user_id:    req.user.userId,
    message,
    response:   aiResponse,
    session_id: session_id || null,
  });

  res.status(201).json({
    success: true,
    data: {
      message:   chat.message,
      response:  chat.response,
      timestamp: chat.timestamp,
      session_id: chat.session_id,
    },
  });
});

// ── GET /api/chat/:reportId/history ───────────────────────────
const getChatHistory = asyncHandler(async (req, res) => {
  const { reportId } = req.params;

  const report = await reportModel.findById(reportId);
  if (!report) throw new ApiError(404, 'Report not found.');
  if (report.user_id !== req.user.userId) throw new ApiError(403, 'Access denied.');

  const history = await chatModel.findByReportId(reportId);

  res.json({ success: true, data: { history, count: history.length } });
});

// ── POST /api/chat/general ────────────────────────────────────
const sendGeneralMessage = asyncHandler(async (req, res) => {
  const { message, session_id } = req.body;

  const aiResponse = await chatWithReport(message, null);

  const chat = await chatModel.createMessage({
    report_id:  null,
    user_id:    req.user.userId,
    message,
    response:   aiResponse,
    session_id: session_id || null,
  });

  res.status(201).json({
    success: true,
    data: {
      message:   chat.message,
      response:  chat.response,
      timestamp: chat.timestamp,
      session_id: chat.session_id,
    },
  });
});

// ── GET /api/chat/general/history ─────────────────────────────
const getGeneralChatHistory = asyncHandler(async (req, res) => {
  const history = await chatModel.findGeneralByUserId(req.user.userId);
  res.json({ success: true, data: { history, count: history.length } });
});

// ── GET /api/chat/sessions ─────────────────────────────────────
// List all saved conversation threads for the logged-in user, most recent first.
const listSessions = asyncHandler(async (req, res) => {
  const sessions = await chatModel.listSessions(req.user.userId);
  res.json({ success: true, data: { sessions, count: sessions.length } });
});

// ── GET /api/chat/sessions/:sessionId ──────────────────────────
// Fetch every message in one saved conversation thread.
const getSessionHistory = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const history = await chatModel.findBySessionId(sessionId, req.user.userId);

  if (history.length === 0) {
    throw new ApiError(404, 'Chat session not found.');
  }

  res.json({ success: true, data: { history, count: history.length } });
});

module.exports = {
  sendMessage,
  getChatHistory,
  sendGeneralMessage,
  getGeneralChatHistory,
  listSessions,
  getSessionHistory,
};
