const pool = require("../config/database");

/**
 * Express middleware to verify that the authenticated JWT user has role = 'admin' in MySQL database
 */
async function requireAdmin(req, res, next) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const [rows] = await pool.execute(
      "SELECT id, role, account_status FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    if (rows.length === 0 || rows[0].account_status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Account is not active or available",
      });
    }

    if (String(rows[0].role || "").toLowerCase() !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required. Permission denied.",
      });
    }

    req.adminUser = rows[0];
    next();
  } catch (error) {
    console.error("Admin middleware authorization error:", error);
    return res.status(500).json({
      success: false,
      message: "Admin authorization check failed",
    });
  }
}

module.exports = {
  requireAdmin,
};
