const express = require("express");
const {
  getDashboard,
  getStats,
  getUsersList,
  getUserDetails,
  updateStatus,
  updateRole,
  getSubscriptions,
  getPayments,
  getAnalytics,
  getAuditLogs,
  getHealth,
} = require("../controllers/admin.controller");
const { authenticateToken } = require("../middleware/auth.middleware");
const { requireAdmin } = require("../middleware/admin.middleware");

const router = express.Router();

// Apply authentication and strict admin role verification to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * GET /api/admin/dashboard
 * Return overall platform metrics, KPIs, demographics, activity, and growth trends
 */
router.get("/dashboard", getDashboard);

/**
 * GET /api/admin/stats
 * Backward compatibility endpoint for summary metrics
 */
router.get("/stats", getStats);

/**
 * GET /api/admin/users
 * Return paginated list of users with search and filtering
 */
router.get("/users", getUsersList);

/**
 * GET /api/admin/users/:id
 * Return detailed user, profile, subscription, and payment details
 */
router.get("/users/:id", getUserDetails);

/**
 * PUT /api/admin/users/:id/status
 * Update user account status (pending_verification, active, suspended, deleted)
 */
router.put("/users/:id/status", updateStatus);

/**
 * PUT /api/admin/users/:id/role
 * Update user role (user, parent, admin)
 */
router.put("/users/:id/role", updateRole);

/**
 * GET /api/admin/subscriptions
 * Return subscription counts, plan distribution, and paginated subscriptions
 */
router.get("/subscriptions", getSubscriptions);

/**
 * GET /api/admin/payments
 * Return payment statistics and paginated transactions log with masked IDs
 */
router.get("/payments", getPayments);

/**
 * GET /api/admin/analytics
 * Return matrimonial engagement analytics
 */
router.get("/analytics", getAnalytics);

/**
 * GET /api/admin/audit-logs
 * Return paginated admin audit trail
 */
router.get("/audit-logs", getAuditLogs);

/**
 * GET /api/admin/health
 * Return system health checks
 */
router.get("/health", getHealth);

module.exports = router;
