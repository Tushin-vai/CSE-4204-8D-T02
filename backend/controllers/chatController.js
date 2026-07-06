// controllers/chatController.js
// Handles: send a message about a report, get chat history
const asyncHandler        = require('../utils/asyncHandler');
const ApiError            = require('../utils/ApiError');
const chatModel           = require('../models/chatModel');
const reportModel         = require('../models/reportModel');
const summaryModel        = require('../models/summaryModel');
const { chatWithReport }  = require('../utils/aiService');

// ── POST /api/chat/:reportId ──────────────────────────────────
const sendMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const { reportId } = req.params;

  // Verify report exists and belongs to user
  const report = await reportModel.findById(reportId);
  if (!report) throw new ApiError(404, 'Report not found.');
  if (report.user_id !== req.user.userId) throw new ApiError(403, 'Access denied.');

  // Get the report summary as context for the AI
  const summary = await summaryModel.findByReportId(reportId);
  const context = summary
    ? `Report: ${report.file_name}. Summary: ${summary.summary_text}`
    : `Report: ${report.file_name}`;

  // Get AI response (mocked for now)
  const aiResponse = await chatWithReport(message, context);

  // Save the chat message + response to DB
  const chat = await chatModel.createMessage({
    report_id:  reportId,
    user_id:    req.user.userId,
    message,
    response:   aiResponse,
    session_id: null,
  });

  res.status(201).json({
    success: true,
    data: {
      message:  chat.message,
      response: chat.response,
      timestamp: chat.timestamp,
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

module.exports = { sendMessage, getChatHistory };
