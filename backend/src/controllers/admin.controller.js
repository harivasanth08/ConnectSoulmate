const adminService = require("../services/admin.service");
const { getAuditLogs } = require("../services/audit.service");

/**
 * GET /api/admin/dashboard
 * Return overall platform metrics, KPIs, demographics, activity, and growth trends
 */
async function getDashboard(req, res) {
  try {
    const data = await adminService.getDashboardOverview();
    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("Admin getDashboard error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch dashboard metrics",
    });
  }
}

/**
 * GET /api/admin/stats
 * Backward compatibility alias for summary stats
 */
async function getStats(req, res) {
  try {
    const stats = await adminService.getAdminStats();
    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Admin getStats error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch admin stats",
    });
  }
}

/**
 * GET /api/admin/users
 * Fetch paginated list of users with multi-column filtering
 */
async function getUsersList(req, res) {
  try {
    const { page, limit, search, status, role, gender } = req.query;

    const result = await adminService.getUsers({
      page,
      limit,
      search,
      status,
      role,
      gender,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Admin getUsersList error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch users list",
    });
  }
}

/**
 * GET /api/admin/users/:id
 * Get detailed dossier for a target user and record admin audit log
 */
async function getUserDetails(req, res) {
  try {
    const targetUserId = Number(req.params.id);
    const adminUserId = req.user?.userId;

    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid user ID is required",
      });
    }

    const data = await adminService.getUserById(targetUserId, adminUserId);

    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("Admin getUserDetails error:", error);
    return res.status(error.statusCode || 404).json({
      success: false,
      message: error.message || "Failed to fetch user details",
    });
  }
}

/**
 * PUT /api/admin/users/:id/status
 * Activate, suspend, or update user account status
 */
async function updateStatus(req, res) {
  try {
    const adminUserId = req.user?.userId;
    const targetUserId = Number(req.params.id);
    const { status } = req.body || {};

    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid user ID is required",
      });
    }

    if (!status || typeof status !== "string") {
      return res.status(400).json({
        success: false,
        message: "Status field is required",
      });
    }

    const result = await adminService.updateUserStatus(
      adminUserId,
      targetUserId,
      status.trim()
    );

    return res.status(200).json({
      success: true,
      message: `User status updated to '${status.trim()}' successfully`,
      ...result,
    });
  } catch (error) {
    console.error("Admin updateStatus error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update user status",
    });
  }
}

/**
 * PUT /api/admin/users/:id/role
 * Change user role (user, parent, admin)
 */
async function updateRole(req, res) {
  try {
    const adminUserId = req.user?.userId;
    const targetUserId = Number(req.params.id);
    const { role } = req.body || {};

    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid user ID is required",
      });
    }

    if (!role || typeof role !== "string") {
      return res.status(400).json({
        success: false,
        message: "Role field is required",
      });
    }

    const result = await adminService.updateUserRole(
      adminUserId,
      targetUserId,
      role.trim()
    );

    return res.status(200).json({
      success: true,
      message: `User role updated to '${role.trim()}' successfully`,
      ...result,
    });
  } catch (error) {
    console.error("Admin updateRole error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update user role",
    });
  }
}

/**
 * GET /api/admin/subscriptions
 * Fetch subscription analytics and paginated list
 */
async function getSubscriptions(req, res) {
  try {
    const { page, limit, status, search } = req.query;
    const data = await adminService.getSubscriptionsAnalytics({
      page,
      limit,
      status,
      search,
    });
    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("Admin getSubscriptions error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch subscriptions data",
    });
  }
}

/**
 * GET /api/admin/payments
 * Fetch payment analytics and transactions
 */
async function getPayments(req, res) {
  try {
    const { page, limit, status, search } = req.query;
    const data = await adminService.getPaymentsAnalytics({
      page,
      limit,
      status,
      search,
    });
    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("Admin getPayments error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch payments data",
    });
  }
}

/**
 * GET /api/admin/analytics
 * Fetch matrimonial engagement analytics (interests, matches, conversations)
 */
async function getAnalytics(req, res) {
  try {
    const data = await adminService.getMatrimonyAnalytics();
    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("Admin getAnalytics error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch matrimonial analytics",
    });
  }
}

/**
 * GET /api/admin/audit-logs
 * Fetch administrative action logs
 */
async function getAuditLogsHandler(req, res) {
  try {
    const { page, limit, action, search } = req.query;
    const data = await getAuditLogs({ page, limit, action, search });
    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("Admin getAuditLogs error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch audit logs",
    });
  }
}

/**
 * GET /api/admin/health
 * Return platform system health checks
 */
async function getHealth(req, res) {
  try {
    const health = await adminService.getSystemHealth();
    return res.status(200).json({
      success: true,
      ...health,
    });
  } catch (error) {
    console.error("Admin getHealth error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to perform system health check",
    });
  }
}

module.exports = {
  getDashboard,
  getStats,
  getUsersList,
  getUserDetails,
  updateStatus,
  updateRole,
  getSubscriptions,
  getPayments,
  getAnalytics,
  getAuditLogs: getAuditLogsHandler,
  getHealth,
};
