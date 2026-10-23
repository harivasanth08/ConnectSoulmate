const pool = require("../config/database");

/**
 * Ensure notifications table exists in MySQL database
 */
async function initNotificationTable() {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(150) NOT NULL,
        message VARCHAR(500) NOT NULL,
        reference_id BIGINT UNSIGNED NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_notifications_user_unread (user_id, is_read),
        INDEX idx_notifications_user_created (user_id, created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  } catch (error) {
    console.error("Failed to initialize notifications table:", error);
  } finally {
    connection.release();
  }
}

/**
 * Create an in-app notification for a target user with duplicate suppression.
 */
async function createNotification({ userId, type, title, message, referenceId = null }) {
  if (!userId || !type || !title || !message) {
    throw new Error("Missing required parameters for notification creation");
  }

  // Idempotency / duplicate suppression check:
  // Avoid duplicate notifications for identical events (e.g. rapid retries or webhook duplicates)
  let checkSql = `
    SELECT id FROM notifications 
    WHERE user_id = ? AND type = ?
  `;
  const checkParams = [userId, type];

  if (referenceId !== null) {
    checkSql += ` AND reference_id = ?`;
    checkParams.push(referenceId);
  }

  // For subscription/shortlist/interest notifications, check recent creation (e.g., within 5 minutes)
  checkSql += ` AND created_at >= NOW() - INTERVAL 5 MINUTE LIMIT 1`;

  const [existing] = await pool.execute(checkSql, checkParams);
  if (existing.length > 0) {
    // Recent duplicate notification exists, skip inserting
    return { success: true, duplicated: true, id: existing[0].id };
  }

  const [result] = await pool.execute(
    `
      INSERT INTO notifications (user_id, type, title, message, reference_id, is_read)
      VALUES (?, ?, ?, ?, ?, 0)
    `,
    [userId, type, title, message, referenceId]
  );

  return {
    success: true,
    id: result.insertId,
    userId,
    type,
    title,
    message,
    referenceId,
  };
}

/**
 * Fetch paginated list of notifications for authenticated user
 */
async function getNotifications({ userId, page = 1, limit = 20 }) {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (parsedPage - 1) * parsedLimit;

  const [countRows] = await pool.execute(
    "SELECT COUNT(*) AS total FROM notifications WHERE user_id = ?",
    [userId]
  );
  const total = Number(countRows[0]?.total || 0);

  const [rows] = await pool.execute(
    `
      SELECT
        id,
        type,
        title,
        message,
        reference_id,
        is_read,
        created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `,
    [userId, parsedLimit, offset]
  );

  const notifications = rows.map((r) => ({
    id: Number(r.id),
    type: r.type,
    title: r.title,
    message: r.message,
    referenceId: r.reference_id !== null ? Number(r.reference_id) : null,
    isRead: Boolean(r.is_read),
    createdAt: r.created_at,
  }));

  return {
    notifications,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit) || 1,
    },
  };
}

/**
 * Fetch unread notification count for user
 */
async function getUnreadCount(userId) {
  const [rows] = await pool.execute(
    "SELECT COUNT(*) AS unread_count FROM notifications WHERE user_id = ? AND is_read = 0",
    [userId]
  );

  return Number(rows[0]?.unread_count || 0);
}

/**
 * Mark a single notification as read, ensuring ownership by authenticated user
 */
async function markAsRead(notificationId, userId) {
  const [rows] = await pool.execute(
    "SELECT id, user_id FROM notifications WHERE id = ? LIMIT 1",
    [notificationId]
  );

  if (rows.length === 0) {
    const error = new Error("Notification not found");
    error.statusCode = 404;
    throw error;
  }

  if (Number(rows[0].user_id) !== Number(userId)) {
    const error = new Error("You are not authorized to update this notification");
    error.statusCode = 403;
    throw error;
  }

  await pool.execute(
    "UPDATE notifications SET is_read = 1 WHERE id = ?",
    [notificationId]
  );

  return { success: true, notificationId: Number(notificationId) };
}

/**
 * Mark all notifications for authenticated user as read
 */
async function markAllAsRead(userId) {
  const [result] = await pool.execute(
    "UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0",
    [userId]
  );

  return {
    success: true,
    affectedRows: result.affectedRows,
  };
}

module.exports = {
  initNotificationTable,
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
