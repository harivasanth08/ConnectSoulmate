const {
  getOrCreateConversation,
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  getUnreadMessageCount,
} = require("../services/message.service");

async function handleGetOrCreateConversation(req, res) {
  try {
    const currentUserId = req.user.userId;
    const recipientUserId = Number(req.body.recipientUserId);

    if (!Number.isInteger(recipientUserId)) {
      return res.status(400).json({
        success: false,
        message: "Valid recipient user ID is required",
      });
    }

    const result = await getOrCreateConversation(currentUserId, recipientUserId);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Get or create conversation error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to initialize conversation",
    });
  }
}

async function handleGetConversations(req, res) {
  try {
    const currentUserId = req.user.userId;
    const limit = req.query.limit ? Number(req.query.limit) : 20;

    const conversations = await getUserConversations(currentUserId, limit);

    return res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
    });
  }
}

async function handleGetMessages(req, res) {
  try {
    const currentUserId = req.user.userId;
    const conversationId = Number(req.params.conversationId);
    const beforeId = req.query.beforeId ? Number(req.query.beforeId) : null;
    const limit = req.query.limit ? Number(req.query.limit) : 20;

    if (!Number.isInteger(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    const result = await getConversationMessages(
      conversationId,
      currentUserId,
      beforeId,
      limit
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Get messages error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch messages",
    });
  }
}

async function handleSendMessage(req, res) {
  try {
    const currentUserId = req.user.userId;
    const conversationId = Number(req.params.conversationId);
    const { message } = req.body;

    if (!Number.isInteger(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    const messageObj = await sendMessage(conversationId, currentUserId, message);

    return res.status(201).json({
      success: true,
      message: messageObj,
    });
  } catch (error) {
    console.error("Send message error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to send message",
    });
  }
}

async function handleMarkAsRead(req, res) {
  try {
    const currentUserId = req.user.userId;
    const conversationId = Number(req.params.conversationId);

    if (!Number.isInteger(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    const result = await markMessagesAsRead(conversationId, currentUserId);

    return res.status(200).json({
      success: true,
      message: "Messages marked as read",
      ...result,
    });
  } catch (error) {
    console.error("Mark read error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to mark messages as read",
    });
  }
}

async function handleGetUnreadCount(req, res) {
  try {
    const currentUserId = req.user.userId;
    const unreadCount = await getUnreadMessageCount(currentUserId);

    return res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch unread count",
    });
  }
}

module.exports = {
  handleGetOrCreateConversation,
  handleGetConversations,
  handleGetMessages,
  handleSendMessage,
  handleMarkAsRead,
  handleGetUnreadCount,
};
