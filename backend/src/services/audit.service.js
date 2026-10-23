const pool = require("../config/database");

/**
 * Safely record an administrative audit log event in MySQL database.
 * Omits any sensitive keys (passwords, tokens, secrets) from metadata.
 */
async function logAdminAction(
  adminUserId,
  action,
  targetType = null,
  targetId = null,
  metadata = null
) {
  try {
    if (!adminUserId || !action) return;

    let sanitizedMeta = null;
    if (metadata && typeof metadata === "object") {
      const copy = { ...metadata };
      // Strip any sensitive keys
      const sensitiveKeys = [
        "password",
        "password_hash",
        "token",
        "jwt",
        "otp",
        "secret",
        "signature",
        "razorpay_secret",
      ];
      for (const k of Object.keys(copy)) {
        if (sensitiveKeys.some((s) => k.toLowerCase().includes(s))) {
          delete copy[k];
        }
      }
      sanitizedMeta = JSON.stringify(copy);
    }

    await pool.execute(
      `
      INSERT INTO admin_audit_logs (
        admin_user_id,
        action,
        target_type,
        target_id,
        metadata
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        adminUserId,
        action,
        targetType,
        targetId ? Number(targetId) : null,
        sanitizedMeta,
      ]
    );
  } catch (error) {
    console.error("Failed to write admin audit log:", error.message);
  }
}

/**
 * Fetch paginated audit logs with search, action filtering, and admin user details.
 */
async function getAuditLogs({ page = 1, limit = 20, action = "", search = "" }) {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (parsedPage - 1) * parsedLimit;

  const whereClauses = [];
  const queryParams = [];

  if (action && action.trim()) {
    whereClauses.push("l.action = ?");
    queryParams.push(action.trim());
  }

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    whereClauses.push("(u.full_name LIKE ? OR u.email LIKE ? OR l.action LIKE ?)");
    queryParams.push(term, term, term);
  }

  const whereSql =
    whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  // Count query
  const countSql = `
    SELECT COUNT(*) AS total
    FROM admin_audit_logs l
    LEFT JOIN users u ON u.id = l.admin_user_id
    ${whereSql}
  `;
  const [countRows] = await pool.execute(countSql, queryParams);
  const total = Number(countRows[0]?.total || 0);

  // Data query
  const dataSql = `
    SELECT
      l.id,
      l.admin_user_id,
      l.action,
      l.target_type,
      l.target_id,
      l.metadata,
      l.created_at,
      u.full_name AS admin_name,
      u.email AS admin_email
    FROM admin_audit_logs l
    LEFT JOIN users u ON u.id = l.admin_user_id
    ${whereSql}
    ORDER BY l.id DESC
    LIMIT ? OFFSET ?
  `;

  const [rows] = await pool.execute(dataSql, [...queryParams, parsedLimit, offset]);

  const logs = rows.map((r) => {
    let parsedMeta = null;
    if (r.metadata) {
      try {
        parsedMeta = typeof r.metadata === "string" ? JSON.parse(r.metadata) : r.metadata;
      } catch (e) {
        parsedMeta = r.metadata;
      }
    }
    return {
      id: Number(r.id),
      adminUserId: Number(r.admin_user_id),
      adminName: r.admin_name || "Admin",
      adminEmail: r.admin_email || "admin@platform",
      action: r.action,
      targetType: r.target_type,
      targetId: r.target_id ? Number(r.target_id) : null,
      metadata: parsedMeta,
      createdAt: r.created_at,
    };
  });

  return {
    logs,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit) || 1,
    },
  };
}

module.exports = {
  logAdminAction,
  getAuditLogs,
};
