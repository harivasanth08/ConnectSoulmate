const pool = require("../config/database");

async function getShortlists(userId) {
  const [rows] = await pool.execute(
    `
      SELECT
        s.id AS shortlist_id,
        s.shortlisted_user_id AS user_id,
        s.created_at,

        CASE WHEN u.role = 'parent' THEN COALESCE(pcp.child_name, p.display_name, u.full_name) ELSE COALESCE(p.display_name, u.full_name) END AS full_name,
        CASE WHEN u.role = 'parent' THEN COALESCE(pcp.child_gender, u.gender) ELSE u.gender END AS gender,
        TIMESTAMPDIFF(YEAR, CASE WHEN u.role = 'parent' THEN COALESCE(pcp.child_date_of_birth, u.date_of_birth) ELSE u.date_of_birth END, CURDATE()) AS age,
        u.role,
        CASE WHEN u.role = 'parent' THEN CONCAT('Managed by ', COALESCE(u.parent_relationship, 'Family')) ELSE 'Self' END AS managed_by,

        p.profile_photo,
        p.city,
        p.state,
        p.education,
        p.occupation

      FROM shortlists s

      INNER JOIN users u
        ON u.id = s.shortlisted_user_id

      LEFT JOIN profiles p
        ON p.user_id = u.id

      LEFT JOIN parent_child_profiles pcp
        ON pcp.parent_user_id = u.id

      WHERE s.user_id = ?
        AND u.account_status = 'active'
        AND (u.role IS NULL OR u.role != 'admin')

      ORDER BY s.created_at DESC
    `,
    [userId]
  );

  return rows.map((row) => ({
    shortlistId: row.shortlist_id,
    userId: row.user_id,
    fullName: row.full_name,
    gender: row.gender,
    age: row.age !== null ? Number(row.age) : null,
    role: row.role,
    managedBy: row.managed_by,
    profilePhoto: row.profile_photo,
    city: row.city,
    state: row.state,
    education: row.education,
    occupation: row.occupation,
    createdAt: row.created_at,
  }));
}

async function addToShortlist(userId, targetUserId) {
  if (userId === targetUserId) {
    const error = new Error("You cannot shortlist your own profile");
    error.statusCode = 400;
    throw error;
  }

  const [users] = await pool.execute(
    `SELECT id, account_status, role FROM users WHERE id = ? LIMIT 1`,
    [targetUserId]
  );

  if (users.length === 0 || users[0].account_status !== "active" || users[0].role === "admin") {
    const error = new Error("User profile is unavailable");
    error.statusCode = 404;
    throw error;
  }

  await pool.execute(
    `
      INSERT INTO shortlists (user_id, shortlisted_user_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)
    `,
    [userId, targetUserId]
  );

  // Trigger in-app notification for target user
  try {
    const [shortlistingUserRows] = await pool.execute(
      "SELECT full_name FROM users WHERE id = ? LIMIT 1",
      [userId]
    );
    const shortlistingName = shortlistingUserRows[0]?.full_name || "Someone";

    const { createNotification } = require("./notification.service");
    await createNotification({
      userId: targetUserId,
      type: "shortlist",
      title: "Someone Shortlisted You",
      message: `${shortlistingName} added your profile to their shortlist.`,
      referenceId: userId,
    });
  } catch (notifErr) {
    console.error("Failed to create shortlist notification:", notifErr);
  }

  return {
    success: true,
    isShortlisted: true,
  };
}

async function removeFromShortlist(userId, targetUserId) {
  const [result] = await pool.execute(
    `
      DELETE FROM shortlists
      WHERE user_id = ? AND shortlisted_user_id = ?
    `,
    [userId, targetUserId]
  );

  return {
    success: true,
    isShortlisted: false,
    affectedRows: result.affectedRows,
  };
}

async function getShortlistStatus(userId, targetUserId) {
  const [rows] = await pool.execute(
    `
      SELECT id
      FROM shortlists
      WHERE user_id = ? AND shortlisted_user_id = ?
      LIMIT 1
    `,
    [userId, targetUserId]
  );

  return rows.length > 0;
}

module.exports = {
  getShortlists,
  addToShortlist,
  removeFromShortlist,
  getShortlistStatus,
};
