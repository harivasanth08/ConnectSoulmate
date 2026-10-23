const notificationService = require("../services/notification.service");

/**
 * GET /api/notifications
 * Fetch paginated list of notifications for authenticated user
 */
async function getUserNotifications(req, res) {
  try {
    const userId = req.user.userId;
    const { page, limit } = req.query;

    const data = await notificationService.getNotifications({
      userId,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("getUserNotifications error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch notifications",
    });
  }
}

/**
 * GET /api/notifications/unread-count
 * Fetch total unread notification count
 */
async function getUnreadNotificationCount(req, res) {
  try {
    const userId = req.user.userId;
    const unreadCount = await notificationService.getUnreadCount(userId);

    return res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error("getUnreadNotificationCount error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch unread count",
    });
  }
}

/**
 * PUT /api/notifications/:id/read
 * Mark single notification as read
 */
async function markNotificationRead(req, res) {
  try {
    const userId = req.user.userId;
    const notificationId = Number(req.params.id);

    if (!Number.isInteger(notificationId) || notificationId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid notification ID is required",
      });
    }

    const result = await notificationService.markAsRead(notificationId, userId);

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      ...result,
    });
  } catch (error) {
    console.error("markNotificationRead error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update notification",
    });
  }
}

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read for current user
 */
async function markAllNotificationsRead(req, res) {
  try {
    const userId = req.user.userId;
    const result = await notificationService.markAllAsRead(userId);

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      ...result,
    });
  } catch (error) {
    console.error("markAllNotificationsRead error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to mark notifications as read",
    });
  }
}

module.exports = {
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
};
