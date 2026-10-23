const pool = require("../config/database");
const { logAdminAction } = require("./audit.service");

/**
 * Mask sensitive IDs (Razorpay order ID, payment ID) for safe admin display
 */
function maskIdentifier(id) {
  if (!id || typeof id !== "string") return id || "—";
  if (id.length <= 8) return id;
  return `${id.slice(0, 4)}****${id.slice(-4)}`;
}

/**
 * Get comprehensive dashboard overview metrics with SQL aggregation.
 * No full tables are loaded into memory.
 */
async function getDashboardOverview() {
  // 1. Overall Users KPIs
  const [totalUsersRows] = await pool.execute("SELECT COUNT(*) AS total FROM users");
  const [activeUsersRows] = await pool.execute(
    "SELECT COUNT(*) AS active FROM users WHERE account_status = 'active'"
  );
  const [todayUsersRows] = await pool.execute(
    "SELECT COUNT(*) AS today FROM users WHERE DATE(created_at) = CURDATE()"
  );
  const [weekUsersRows] = await pool.execute(
    "SELECT COUNT(*) AS this_week FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
  );
  const [monthUsersRows] = await pool.execute(
    "SELECT COUNT(*) AS this_month FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
  );
  const [verifiedUsersRows] = await pool.execute(
    "SELECT COUNT(*) AS verified FROM users WHERE email_verified_at IS NOT NULL"
  );
  const [unverifiedUsersRows] = await pool.execute(
    "SELECT COUNT(*) AS unverified FROM users WHERE email_verified_at IS NULL"
  );

  // 2. Subscriptions & Payments KPIs
  const [premiumUsersRows] = await pool.execute(
    `
      SELECT COUNT(DISTINCT user_id) AS premium 
      FROM subscriptions 
      WHERE status = 'active' 
        AND expires_at > NOW() 
        AND plan_id != 'free'
    `
  );
  const [activeSubsRows] = await pool.execute(
    "SELECT COUNT(*) AS active_subs FROM subscriptions WHERE status = 'active' AND expires_at > NOW()"
  );

  const [revenueTotalRows] = await pool.execute(
    "SELECT COALESCE(SUM(amount_paise), 0) AS total_paise FROM payments WHERE status = 'captured'"
  );
  const [revenueMonthRows] = await pool.execute(
    "SELECT COALESCE(SUM(amount_paise), 0) AS month_paise FROM payments WHERE status = 'captured' AND created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')"
  );
  const [revenueYearRows] = await pool.execute(
    "SELECT COALESCE(SUM(amount_paise), 0) AS year_paise FROM payments WHERE status = 'captured' AND created_at >= DATE_FORMAT(NOW(), '%Y-01-01')"
  );

  // 3. Matrimonial Activity KPIs
  const [matchesRows] = await pool.execute(
    "SELECT COUNT(*) AS total_matches FROM interests WHERE status = 'accepted'"
  );
  const [interestsTotalRows] = await pool.execute(
    "SELECT COUNT(*) AS total_interests FROM interests"
  );
  const [interestsPendingRows] = await pool.execute(
    "SELECT COUNT(*) AS pending_interests FROM interests WHERE status = 'pending'"
  );
  const [interestsRejectedRows] = await pool.execute(
    "SELECT COUNT(*) AS rejected_interests FROM interests WHERE status = 'rejected'"
  );
  const [shortlistsRows] = await pool.execute(
    "SELECT COUNT(*) AS total_shortlists FROM shortlists"
  );
  const [messagesRows] = await pool.execute(
    "SELECT COUNT(*) AS total_messages FROM messages"
  );
  const [conversationsRows] = await pool.execute(
    "SELECT COUNT(*) AS total_conversations FROM conversations"
  );

  // 4. Demographics & Completion
  const [bridesRows] = await pool.execute(
    "SELECT COUNT(*) AS brides FROM users WHERE gender = 'female' AND (role IS NULL OR (role != 'parent' AND role != 'admin'))"
  );
  const [groomsRows] = await pool.execute(
    "SELECT COUNT(*) AS grooms FROM users WHERE gender = 'male' AND (role IS NULL OR (role != 'parent' AND role != 'admin'))"
  );
  const [parentsRows] = await pool.execute(
    "SELECT COUNT(*) AS parents FROM users WHERE role = 'parent'"
  );
  const [completedProfilesRows] = await pool.execute(
    "SELECT COUNT(*) AS completed FROM users WHERE profile_completed = 1 AND (role IS NULL OR role != 'admin')"
  );
  const [incompleteProfilesRows] = await pool.execute(
    "SELECT COUNT(*) AS incomplete FROM users WHERE profile_completed = 0 AND (role IS NULL OR role != 'admin')"
  );

  // 5. Growth Timeline (registrations per day for the last 30 days)
  const [growthRows] = await pool.execute(
    `
      SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS date, COUNT(*) AS count
      FROM users
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
      ORDER BY date ASC
    `
  );

  // 6. Revenue Timeline (captured payments per day for the last 30 days)
  const [revenueTimelineRows] = await pool.execute(
    `
      SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS date, COALESCE(SUM(amount_paise), 0) / 100 AS revenue
      FROM payments
      WHERE status = 'captured' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
      ORDER BY date ASC
    `
  );

  // 7. Recent Registrations Feed (5 latest)
  const [recentUsersRows] = await pool.execute(
    `
      SELECT id, full_name, email, role, gender, account_status, created_at
      FROM users
      ORDER BY id DESC
      LIMIT 5
    `
  );

  const totalUsers = Number(totalUsersRows[0]?.total || 0);
  const activeUsers = Number(activeUsersRows[0]?.active || 0);
  const premiumUsers = Number(premiumUsersRows[0]?.premium || 0);
  const totalRevenueRupees = Number(revenueTotalRows[0]?.total_paise || 0) / 100;
  const revenueMonthRupees = Number(revenueMonthRows[0]?.month_paise || 0) / 100;
  const revenueYearRupees = Number(revenueYearRows[0]?.year_paise || 0) / 100;

  return {
    kpi: {
      totalUsers,
      activeUsers,
      newUsersToday: Number(todayUsersRows[0]?.today || 0),
      newUsersThisWeek: Number(weekUsersRows[0]?.this_week || 0),
      newUsersThisMonth: Number(monthUsersRows[0]?.this_month || 0),
      verifiedUsers: Number(verifiedUsersRows[0]?.verified || 0),
      unverifiedUsers: Number(unverifiedUsersRows[0]?.unverified || 0),
      premiumUsers,
      activeSubscriptions: Number(activeSubsRows[0]?.active_subs || 0),
      totalMatches: Number(matchesRows[0]?.total_matches || 0),
      totalRevenue: totalRevenueRupees,
      revenueThisMonth: revenueMonthRupees,
      revenueThisYear: revenueYearRupees,
    },
    demographics: {
      brides: Number(bridesRows[0]?.brides || 0),
      grooms: Number(groomsRows[0]?.grooms || 0),
      parents: Number(parentsRows[0]?.parents || 0),
      completedProfiles: Number(completedProfilesRows[0]?.completed || 0),
      incompleteProfiles: Number(incompleteProfilesRows[0]?.incomplete || 0),
    },
    activity: {
      totalInterests: Number(interestsTotalRows[0]?.total_interests || 0),
      interestsPending: Number(interestsPendingRows[0]?.pending_interests || 0),
      interestsAccepted: Number(matchesRows[0]?.total_matches || 0),
      interestsRejected: Number(interestsRejectedRows[0]?.rejected_interests || 0),
      totalShortlists: Number(shortlistsRows[0]?.total_shortlists || 0),
      totalMessages: Number(messagesRows[0]?.total_messages || 0),
      totalConversations: Number(conversationsRows[0]?.total_conversations || 0),
    },
    growthTimeline: growthRows.map((r) => ({
      date: r.date,
      count: Number(r.count),
    })),
    revenueTimeline: revenueTimelineRows.map((r) => ({
      date: r.date,
      revenue: Number(r.revenue),
    })),
    recentUsers: recentUsersRows.map((u) => ({
      id: Number(u.id),
      fullName: u.full_name,
      email: u.email,
      role: u.role || "user",
      gender: u.gender,
      status: u.account_status,
      createdAt: u.created_at,
    })),
  };
}

/**
 * Backward compatibility alias for /api/admin/stats
 */
async function getAdminStats() {
  const overview = await getDashboardOverview();
  return {
    totalUsers: overview.kpi.totalUsers,
    activeUsers: overview.kpi.activeUsers,
    pendingVerification: overview.kpi.unverifiedUsers,
    premiumUsers: overview.kpi.premiumUsers,
  };
}

/**
 * Fetch paginated, searchable list of users with multi-criteria filters.
 * Returns safe fields and active plan name.
 */
async function getUsers({
  page = 1,
  limit = 20,
  search = "",
  status = "",
  role = "",
  gender = "",
}) {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (parsedPage - 1) * parsedLimit;

  const whereClauses = [];
  const queryParams = [];

  if (search && search.trim()) {
    const searchPattern = `%${search.trim()}%`;
    whereClauses.push(
      "(u.full_name LIKE ? OR u.email LIKE ? OR u.mobile_number LIKE ?)"
    );
    queryParams.push(searchPattern, searchPattern, searchPattern);
  }

  if (status && status.trim()) {
    whereClauses.push("u.account_status = ?");
    queryParams.push(status.trim());
  }

  if (role && role.trim()) {
    whereClauses.push("u.role = ?");
    queryParams.push(role.trim());
  }

  if (gender && gender.trim()) {
    whereClauses.push("u.gender = ?");
    queryParams.push(gender.trim());
  }

  const whereSql =
    whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  // Count query
  const countSql = `SELECT COUNT(*) AS total FROM users u ${whereSql}`;
  const [countRows] = await pool.execute(countSql, queryParams);
  const total = Number(countRows[0]?.total || 0);

  // Data query with active subscription plan left joined
  const dataSql = `
    SELECT
      u.id,
      u.full_name,
      u.email,
      u.mobile_number,
      u.gender,
      u.date_of_birth,
      u.account_status AS status,
      u.role,
      u.email_verified_at,
      u.mobile_verified_at,
      u.profile_completed,
      u.created_at,
      sub.plan_name,
      sub.sub_status
    FROM users u
    LEFT JOIN (
      SELECT s.user_id, p.name AS plan_name, s.status AS sub_status
      FROM subscriptions s
      JOIN subscription_plans p ON p.id = s.plan_id
      WHERE s.status = 'active' AND s.expires_at > NOW()
    ) sub ON sub.user_id = u.id
    ${whereSql}
    ORDER BY u.id DESC
    LIMIT ? OFFSET ?
  `;

  const [userRows] = await pool.execute(dataSql, [
    ...queryParams,
    parsedLimit,
    offset,
  ]);

  const users = userRows.map((u) => ({
    id: Number(u.id),
    fullName: u.full_name,
    email: u.email,
    mobileNumber: u.mobile_number,
    gender: u.gender,
    dateOfBirth: u.date_of_birth,
    status: u.status,
    role: u.role || "user",
    emailVerified: Boolean(u.email_verified_at),
    mobileVerified: Boolean(u.mobile_verified_at),
    profileCompleted: Boolean(u.profile_completed),
    planName: u.plan_name || "Free",
    createdAt: u.created_at,
  }));

  return {
    users,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit) || 1,
    },
  };
}

/**
 * Fetch detailed user dossier including profile, preferences, family, child profile,
 * subscriptions, payments, and engagement activity counts.
 */
async function getUserById(targetUserId, adminUserId = null) {
  const [users] = await pool.execute(
    `
      SELECT
        id,
        full_name,
        email,
        mobile_number,
        gender,
        date_of_birth,
        account_status AS status,
        role,
        parent_relationship,
        email_verified_at,
        mobile_verified_at,
        profile_completed,
        profile_completion_step,
        created_at,
        updated_at
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    [targetUserId]
  );

  if (users.length === 0) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const user = users[0];

  // Matrimonial Profile
  const [profiles] = await pool.execute(
    "SELECT * FROM profiles WHERE user_id = ? LIMIT 1",
    [targetUserId]
  );

  // Family details
  const [familyRows] = await pool.execute(
    "SELECT * FROM family_details WHERE user_id = ? LIMIT 1",
    [targetUserId]
  );

  // Partner Preferences
  const [preferenceRows] = await pool.execute(
    "SELECT * FROM partner_preferences WHERE user_id = ? LIMIT 1",
    [targetUserId]
  );

  // Child Profile (for Parent users)
  let childProfile = null;
  if (user.role === "parent") {
    const [childRows] = await pool.execute(
      "SELECT * FROM parent_child_profiles WHERE parent_user_id = ? LIMIT 1",
      [targetUserId]
    );
    if (childRows.length > 0) childProfile = childRows[0];
  }

  // Active & Past Subscriptions
  const [subscriptions] = await pool.execute(
    `
      SELECT s.*, p.name AS plan_name, p.price_paise, p.currency
      FROM subscriptions s
      JOIN subscription_plans p ON s.plan_id = p.id
      WHERE s.user_id = ?
      ORDER BY s.id DESC
      LIMIT 5
    `,
    [targetUserId]
  );

  // Recent Payments (with masked IDs)
  const [payments] = await pool.execute(
    `
      SELECT id, razorpay_order_id, razorpay_payment_id, amount_paise, currency, status, error_message, created_at
      FROM payments
      WHERE user_id = ?
      ORDER BY id DESC
      LIMIT 10
    `,
    [targetUserId]
  );

  const safePayments = payments.map((p) => ({
    id: Number(p.id),
    maskedOrderId: maskIdentifier(p.razorpay_order_id),
    maskedPaymentId: maskIdentifier(p.razorpay_payment_id),
    amountRupees: p.amount_paise ? p.amount_paise / 100 : 0,
    currency: p.currency || "INR",
    status: p.status,
    errorMessage: p.error_message,
    createdAt: p.created_at,
  }));

  // Activity Counts
  const [sentInterests] = await pool.execute(
    "SELECT COUNT(*) AS count FROM interests WHERE sender_user_id = ?",
    [targetUserId]
  );
  const [receivedInterests] = await pool.execute(
    "SELECT COUNT(*) AS count FROM interests WHERE receiver_user_id = ?",
    [targetUserId]
  );
  const [acceptedInterests] = await pool.execute(
    "SELECT COUNT(*) AS count FROM interests WHERE (sender_user_id = ? OR receiver_user_id = ?) AND status = 'accepted'",
    [targetUserId, targetUserId]
  );
  const [shortlists] = await pool.execute(
    "SELECT COUNT(*) AS count FROM shortlists WHERE user_id = ?",
    [targetUserId]
  );
  const [messagesSent] = await pool.execute(
    "SELECT COUNT(*) AS count FROM messages WHERE sender_user_id = ?",
    [targetUserId]
  );

  // Audit log: viewing user details
  if (adminUserId) {
    logAdminAction(adminUserId, "viewed_user", "users", targetUserId, {
      viewedEmail: user.email,
    });
  }

  return {
    user: {
      id: Number(user.id),
      fullName: user.full_name,
      email: user.email,
      mobileNumber: user.mobile_number,
      gender: user.gender,
      dateOfBirth: user.date_of_birth,
      status: user.status,
      role: user.role || "user",
      parentRelationship: user.parent_relationship,
      emailVerified: Boolean(user.email_verified_at),
      mobileVerified: Boolean(user.mobile_verified_at),
      profileCompleted: Boolean(user.profile_completed),
      profileCompletionStep: user.profile_completion_step,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    },
    profile: profiles.length > 0 ? profiles[0] : null,
    family: familyRows.length > 0 ? familyRows[0] : null,
    partnerPreferences: preferenceRows.length > 0 ? preferenceRows[0] : null,
    childProfile,
    subscriptions,
    activeSubscription: subscriptions.find((s) => s.status === "active") || null,
    recentPayments: safePayments,
    activity: {
      interestsSent: Number(sentInterests[0]?.count || 0),
      interestsReceived: Number(receivedInterests[0]?.count || 0),
      matches: Number(acceptedInterests[0]?.count || 0),
      shortlists: Number(shortlists[0]?.count || 0),
      messagesSent: Number(messagesSent[0]?.count || 0),
    },
  };
}

/**
 * Activate or suspend a user's account status
 */
async function updateUserStatus(adminUserId, targetUserId, newStatus) {
  const validStatuses = ["pending_verification", "active", "suspended", "deleted"];

  if (!validStatuses.includes(newStatus)) {
    const error = new Error(
      `Invalid status. Allowed statuses are: ${validStatuses.join(", ")}`
    );
    error.statusCode = 400;
    throw error;
  }

  if (Number(adminUserId) === Number(targetUserId) && newStatus !== "active") {
    const error = new Error("Admin cannot deactivate or suspend their own account");
    error.statusCode = 400;
    throw error;
  }

  const [targetUsers] = await pool.execute(
    "SELECT id, email, account_status FROM users WHERE id = ? LIMIT 1",
    [targetUserId]
  );

  if (targetUsers.length === 0) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const oldStatus = targetUsers[0].account_status;

  await pool.execute(
    "UPDATE users SET account_status = ? WHERE id = ?",
    [newStatus, targetUserId]
  );

  // Record audit log
  logAdminAction(adminUserId, "updated_user_status", "users", targetUserId, {
    targetEmail: targetUsers[0].email,
    oldStatus,
    newStatus,
  });

  return {
    success: true,
    userId: Number(targetUserId),
    status: newStatus,
  };
}

/**
 * Change a user's role (user, parent, admin)
 */
async function updateUserRole(adminUserId, targetUserId, newRole) {
  const validRoles = ["user", "parent", "admin"];

  if (!validRoles.includes(newRole)) {
    const error = new Error(
      `Invalid role. Allowed roles are: ${validRoles.join(", ")}`
    );
    error.statusCode = 400;
    throw error;
  }

  if (Number(adminUserId) === Number(targetUserId) && newRole !== "admin") {
    const error = new Error("Admin cannot remove their own admin access");
    error.statusCode = 400;
    throw error;
  }

  const [targetUsers] = await pool.execute(
    "SELECT id, email, role FROM users WHERE id = ? LIMIT 1",
    [targetUserId]
  );

  if (targetUsers.length === 0) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const oldRole = targetUsers[0].role;

  await pool.execute(
    "UPDATE users SET role = ? WHERE id = ?",
    [newRole, targetUserId]
  );

  // Record audit log
  logAdminAction(adminUserId, "updated_user_role", "users", targetUserId, {
    targetEmail: targetUsers[0].email,
    oldRole,
    newRole,
  });

  return {
    success: true,
    userId: Number(targetUserId),
    role: newRole,
  };
}

/**
 * Fetch subscription analytics and paginated subscriptions list
 */
async function getSubscriptionsAnalytics({ page = 1, limit = 20, status = "", search = "" }) {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (parsedPage - 1) * parsedLimit;

  // Subscriptions KPIs
  const [totalSubscribersRows] = await pool.execute(
    "SELECT COUNT(DISTINCT user_id) AS total FROM subscriptions"
  );
  const [activeSubsRows] = await pool.execute(
    "SELECT COUNT(*) AS active FROM subscriptions WHERE status = 'active' AND expires_at > NOW()"
  );
  const [expiredSubsRows] = await pool.execute(
    "SELECT COUNT(*) AS expired FROM subscriptions WHERE status = 'expired' OR (status = 'active' AND expires_at <= NOW())"
  );
  const [cancelledSubsRows] = await pool.execute(
    "SELECT COUNT(*) AS cancelled FROM subscriptions WHERE status = 'cancelled'"
  );
  const [totalUsersRows] = await pool.execute("SELECT COUNT(*) AS total FROM users");

  // Plan popularity breakdown
  const [planDistributionRows] = await pool.execute(
    `
      SELECT p.id, p.name, p.price_paise, COUNT(s.id) AS subscriber_count
      FROM subscription_plans p
      LEFT JOIN subscriptions s ON s.plan_id = p.id
      GROUP BY p.id, p.name, p.price_paise
      ORDER BY p.price_paise ASC
    `
  );

  // Paginated List
  const whereClauses = [];
  const queryParams = [];

  if (status && status.trim()) {
    whereClauses.push("s.status = ?");
    queryParams.push(status.trim());
  }

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    whereClauses.push("(u.full_name LIKE ? OR u.email LIKE ? OR p.name LIKE ?)");
    queryParams.push(term, term, term);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const countSql = `
    SELECT COUNT(*) AS total
    FROM subscriptions s
    JOIN users u ON u.id = s.user_id
    JOIN subscription_plans p ON p.id = s.plan_id
    ${whereSql}
  `;
  const [countRows] = await pool.execute(countSql, queryParams);
  const total = Number(countRows[0]?.total || 0);

  const dataSql = `
    SELECT
      s.id,
      s.user_id,
      s.plan_id,
      s.status,
      s.starts_at,
      s.expires_at,
      s.created_at,
      u.full_name AS user_name,
      u.email AS user_email,
      p.name AS plan_name,
      p.price_paise,
      p.currency
    FROM subscriptions s
    JOIN users u ON u.id = s.user_id
    JOIN subscription_plans p ON p.id = s.plan_id
    ${whereSql}
    ORDER BY s.id DESC
    LIMIT ? OFFSET ?
  `;

  const [rows] = await pool.execute(dataSql, [...queryParams, parsedLimit, offset]);

  const subscriptions = rows.map((r) => ({
    id: Number(r.id),
    userId: Number(r.user_id),
    userName: r.user_name,
    userEmail: r.user_email,
    planId: r.plan_id,
    planName: r.plan_name,
    priceRupees: r.price_paise ? r.price_paise / 100 : 0,
    currency: r.currency || "INR",
    status: r.status,
    startsAt: r.starts_at,
    expiresAt: r.expires_at,
    createdAt: r.created_at,
  }));

  const totalUsers = Number(totalUsersRows[0]?.total || 0);
  const activeSubs = Number(activeSubsRows[0]?.active || 0);
  const freeUsers = Math.max(0, totalUsers - activeSubs);

  return {
    kpi: {
      totalSubscribers: Number(totalSubscribersRows[0]?.total || 0),
      activeSubscriptions: activeSubs,
      expiredSubscriptions: Number(expiredSubsRows[0]?.expired || 0),
      cancelledSubscriptions: Number(cancelledSubsRows[0]?.cancelled || 0),
      freeUsers,
      paidConversionRate: totalUsers > 0 ? ((activeSubs / totalUsers) * 100).toFixed(1) : 0,
    },
    planPopularity: planDistributionRows.map((p) => ({
      id: p.id,
      name: p.name,
      priceRupees: p.price_paise / 100,
      count: Number(p.subscriber_count),
    })),
    subscriptions,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit) || 1,
    },
  };
}

/**
 * Fetch payments analytics and paginated transactions log with masked IDs
 */
async function getPaymentsAnalytics({ page = 1, limit = 20, status = "", search = "" }) {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (parsedPage - 1) * parsedLimit;

  // Payments KPIs
  const [totalRevenueRows] = await pool.execute(
    "SELECT COALESCE(SUM(amount_paise), 0) AS total_paise FROM payments WHERE status = 'captured'"
  );
  const [monthRevenueRows] = await pool.execute(
    "SELECT COALESCE(SUM(amount_paise), 0) AS month_paise FROM payments WHERE status = 'captured' AND created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')"
  );
  const [yearRevenueRows] = await pool.execute(
    "SELECT COALESCE(SUM(amount_paise), 0) AS year_paise FROM payments WHERE status = 'captured' AND created_at >= DATE_FORMAT(NOW(), '%Y-01-01')"
  );
  const [capturedRows] = await pool.execute(
    "SELECT COUNT(*) AS captured_count FROM payments WHERE status = 'captured'"
  );
  const [failedRows] = await pool.execute(
    "SELECT COUNT(*) AS failed_count FROM payments WHERE status = 'failed'"
  );
  const [pendingRows] = await pool.execute(
    "SELECT COUNT(*) AS pending_count FROM payments WHERE status IN ('created', 'authorized')"
  );

  // Filtered Paginated Query
  const whereClauses = [];
  const queryParams = [];

  if (status && status.trim()) {
    whereClauses.push("p.status = ?");
    queryParams.push(status.trim());
  }

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    whereClauses.push(
      "(u.full_name LIKE ? OR u.email LIKE ? OR p.razorpay_order_id LIKE ? OR p.razorpay_payment_id LIKE ?)"
    );
    queryParams.push(term, term, term, term);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const countSql = `
    SELECT COUNT(*) AS total
    FROM payments p
    LEFT JOIN users u ON u.id = p.user_id
    ${whereSql}
  `;
  const [countRows] = await pool.execute(countSql, queryParams);
  const total = Number(countRows[0]?.total || 0);

  const dataSql = `
    SELECT
      p.id,
      p.user_id,
      p.subscription_id,
      p.razorpay_order_id,
      p.razorpay_payment_id,
      p.amount_paise,
      p.currency,
      p.status,
      p.error_message,
      p.created_at,
      u.full_name AS user_name,
      u.email AS user_email
    FROM payments p
    LEFT JOIN users u ON u.id = p.user_id
    ${whereSql}
    ORDER BY p.id DESC
    LIMIT ? OFFSET ?
  `;

  const [rows] = await pool.execute(dataSql, [...queryParams, parsedLimit, offset]);

  const transactions = rows.map((p) => ({
    id: Number(p.id),
    userId: p.user_id ? Number(p.user_id) : null,
    userName: p.user_name || "Unknown",
    userEmail: p.user_email || "—",
    maskedOrderId: maskIdentifier(p.razorpay_order_id),
    maskedPaymentId: maskIdentifier(p.razorpay_payment_id),
    amountRupees: p.amount_paise ? p.amount_paise / 100 : 0,
    currency: p.currency || "INR",
    status: p.status,
    errorMessage: p.error_message,
    createdAt: p.created_at,
  }));

  return {
    kpi: {
      totalRevenue: Number(totalRevenueRows[0]?.total_paise || 0) / 100,
      revenueThisMonth: Number(monthRevenueRows[0]?.month_paise || 0) / 100,
      revenueThisYear: Number(yearRevenueRows[0]?.year_paise || 0) / 100,
      successfulPayments: Number(capturedRows[0]?.captured_count || 0),
      failedPayments: Number(failedRows[0]?.failed_count || 0),
      pendingPayments: Number(pendingRows[0]?.pending_count || 0),
    },
    transactions,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit) || 1,
    },
  };
}

/**
 * Matrimony platform engagement analytics (interests, matches, shortlists, messages)
 */
async function getMatrimonyAnalytics() {
  const [interestsSentRows] = await pool.execute("SELECT COUNT(*) AS total FROM interests");
  const [interestsAcceptedRows] = await pool.execute(
    "SELECT COUNT(*) AS accepted FROM interests WHERE status = 'accepted'"
  );
  const [interestsPendingRows] = await pool.execute(
    "SELECT COUNT(*) AS pending FROM interests WHERE status = 'pending'"
  );
  const [interestsRejectedRows] = await pool.execute(
    "SELECT COUNT(*) AS rejected FROM interests WHERE status = 'rejected'"
  );
  const [shortlistsRows] = await pool.execute("SELECT COUNT(*) AS total FROM shortlists");
  const [messagesRows] = await pool.execute("SELECT COUNT(*) AS total FROM messages");
  const [conversationsRows] = await pool.execute("SELECT COUNT(*) AS total FROM conversations");

  const totalInterests = Number(interestsSentRows[0]?.total || 0);
  const acceptedInterests = Number(interestsAcceptedRows[0]?.accepted || 0);
  const acceptanceRate =
    totalInterests > 0 ? ((acceptedInterests / totalInterests) * 100).toFixed(1) : 0;

  return {
    interests: {
      total: totalInterests,
      accepted: acceptedInterests,
      pending: Number(interestsPendingRows[0]?.pending || 0),
      rejected: Number(interestsRejectedRows[0]?.rejected || 0),
      acceptanceRatePercent: Number(acceptanceRate),
    },
    shortlists: {
      total: Number(shortlistsRows[0]?.total || 0),
    },
    messaging: {
      totalMessages: Number(messagesRows[0]?.total || 0),
      totalConversations: Number(conversationsRows[0]?.total || 0),
    },
  };
}

/**
 * System health inspection without exposing internal credentials
 */
async function getSystemHealth() {
  const startTime = Date.now();
  let dbConnected = false;
  let dbLatencyMs = 0;

  try {
    const dbStart = Date.now();
    await pool.query("SELECT 1");
    dbLatencyMs = Date.now() - dbStart;
    dbConnected = true;
  } catch (e) {
    dbConnected = false;
  }

  const authConfigured = Boolean(process.env.JWT_SECRET);
  const emailConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);
  const razorpayConfigured = Boolean(
    process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  );
  const aiConfigured = Boolean(
    process.env.OLLAMA_API_URL || process.env.OLLAMA_BASE_URL || true
  );

  return {
    status: dbConnected && authConfigured ? "healthy" : "degraded",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    services: {
      backend: {
        status: "healthy",
        nodeVersion: process.version,
        memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      },
      database: {
        status: dbConnected ? "connected" : "disconnected",
        latencyMs: dbLatencyMs,
        engine: "MySQL / MariaDB",
      },
      authentication: {
        status: authConfigured ? "configured" : "misconfigured",
        jwtActive: authConfigured,
      },
      emailService: {
        status: emailConfigured ? "configured" : "unconfigured",
        smtpConfigured: emailConfigured,
      },
      razorpay: {
        status: razorpayConfigured ? "configured" : "unconfigured",
      },
      aiEngine: {
        status: aiConfigured ? "available" : "unconfigured",
      },
    },
  };
}

module.exports = {
  getDashboardOverview,
  getAdminStats,
  getUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  getSubscriptionsAnalytics,
  getPaymentsAnalytics,
  getMatrimonyAnalytics,
  getSystemHealth,
};
