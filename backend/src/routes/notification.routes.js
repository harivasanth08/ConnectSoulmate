const express = require("express");
const {
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
} = require("../controllers/notification.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

const router = express.Router();

// Enforce JWT authentication on all notification endpoints
router.use(authenticateToken);

/**
 * GET /api/notifications
 * Fetch latest notifications with pagination for current user
 */
router.get("/", getUserNotifications);

/**
 * GET /api/notifications/unread-count
 * Fetch total unread notification count
 */
router.get("/unread-count", getUnreadNotificationCount);

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read for current user
 */
router.put("/read-all", markAllNotificationsRead);

/**
 * PUT /api/notifications/:id/read
 * Mark a specific notification as read
 */
router.put("/:id/read", markNotificationRead);

module.exports = router;
