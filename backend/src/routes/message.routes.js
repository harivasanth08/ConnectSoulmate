const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  handleGetOrCreateConversation,
  handleGetConversations,
  handleGetMessages,
  handleSendMessage,
  handleMarkAsRead,
  handleGetUnreadCount,
} = require("../controllers/message.controller");

const { authenticateToken } = require("../middleware/auth.middleware");

const router = express.Router();

const sendMessageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // max 30 messages per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many messages sent. Please slow down.",
  },
});

router.use(authenticateToken);

router.get("/conversations", handleGetConversations);
router.post("/conversations", handleGetOrCreateConversation);
router.get("/unread-count", handleGetUnreadCount);

router.get("/conversations/:conversationId", handleGetMessages);
router.post("/conversations/:conversationId", sendMessageLimiter, handleSendMessage);
router.put("/conversations/:conversationId/read", handleMarkAsRead);

module.exports = router;
