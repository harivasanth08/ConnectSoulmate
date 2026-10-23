const pool = require("../config/database");
const { createNotification } = require("./notification.service");

async function createInterest(senderUserId, receiverUserId) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    if (senderUserId === receiverUserId) {
      const error = new Error(
        "You cannot send an interest to yourself"
      );
      error.statusCode = 400;
      throw error;
    }

    const [users] = await connection.execute(
      `
        SELECT id, account_status, role
        FROM users
        WHERE id IN (?, ?)
      `,
      [senderUserId, receiverUserId]
    );

    if (users.length !== 2) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const sender = users.find((user) => user.id === senderUserId);
    const receiver = users.find((user) => user.id === receiverUserId);

    if (
      !receiver ||
      receiver.account_status !== "active" ||
      receiver.role === "admin" ||
      sender?.role === "admin"
    ) {
      const error = new Error("This user is not available");
      error.statusCode = 404;
      throw error;
    }

    const [existingRows] =
      await connection.execute(
        `
          SELECT
            id,
            sender_user_id,
            receiver_user_id,
            status,
            created_at,
            updated_at
          FROM interests
          WHERE sender_user_id = ?
            AND receiver_user_id = ?
          LIMIT 1
        `,
        [senderUserId, receiverUserId]
      );

    if (existingRows.length > 0) {
      const existing = existingRows[0];

      if (existing.status === "pending") {
        const error = new Error(
          "Interest already sent"
        );
        error.statusCode = 409;
        throw error;
      }

      if (existing.status === "accepted") {
        const error = new Error(
          "Interest has already been accepted"
        );
        error.statusCode = 409;
        throw error;
      }

      await connection.execute(
        `
          UPDATE interests
          SET status = 'pending'
          WHERE id = ?
        `,
        [existing.id]
      );
    } else {
      await connection.execute(
        `
          INSERT INTO interests (
            sender_user_id,
            receiver_user_id,
            status
          )
          VALUES (?, ?, 'pending')
        `,
        [senderUserId, receiverUserId]
      );
    }

    const [rows] = await connection.execute(
      `
        SELECT
          id,
          sender_user_id,
          receiver_user_id,
          status,
          created_at,
          updated_at
        FROM interests
        WHERE sender_user_id = ?
          AND receiver_user_id = ?
        LIMIT 1
      `,
      [senderUserId, receiverUserId]
    );

    await connection.commit();

    // Trigger in-app notification after successful transaction
    try {
      const [senderRows] = await pool.execute(
        "SELECT full_name FROM users WHERE id = ? LIMIT 1",
        [senderUserId]
      );
      const senderName = senderRows[0]?.full_name || "Someone";

      await createNotification({
        userId: receiverUserId,
        type: "interest_received",
        title: "New Interest Received",
        message: `${senderName} has shown interest in your profile.`,
        referenceId: senderUserId,
      });
    } catch (notifErr) {
      console.error("Failed to create interest_received notification:", notifErr);
    }

    return formatInterest(rows[0]);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getReceivedInterests(userId) {
  const [rows] = await pool.execute(
    `
      SELECT
        i.id,
        i.sender_user_id,
        i.receiver_user_id,
        i.status,
        i.created_at,
        i.updated_at,

        CASE WHEN u.role = 'parent' THEN COALESCE(pcp.child_name, p.display_name, u.full_name) ELSE COALESCE(p.display_name, u.full_name) END AS full_name,
        u.email,
        CASE WHEN u.role = 'parent' THEN COALESCE(pcp.child_gender, u.gender) ELSE u.gender END AS gender,
        TIMESTAMPDIFF(YEAR, CASE WHEN u.role = 'parent' THEN COALESCE(pcp.child_date_of_birth, u.date_of_birth) ELSE u.date_of_birth END, CURDATE()) AS age,
        u.role,
        CASE WHEN u.role = 'parent' THEN CONCAT('Managed by ', COALESCE(u.parent_relationship, 'Family')) ELSE 'Self' END AS managed_by,

        p.profile_photo,
        p.city,
        p.state,
        p.education,
        p.occupation

      FROM interests i

      INNER JOIN users u
        ON u.id = i.sender_user_id

      LEFT JOIN profiles p
        ON p.user_id = u.id

      LEFT JOIN parent_child_profiles pcp
        ON pcp.parent_user_id = u.id

      WHERE i.receiver_user_id = ?
        AND (u.role IS NULL OR u.role != 'admin')

      ORDER BY i.created_at DESC
    `,
    [userId]
  );

  return rows.map(formatReceivedInterest);
}

async function getSentInterests(userId) {
  const [rows] = await pool.execute(
    `
      SELECT
        i.id,
        i.sender_user_id,
        i.receiver_user_id,
        i.status,
        i.created_at,
        i.updated_at,

        CASE WHEN u.role = 'parent' THEN COALESCE(pcp.child_name, p.display_name, u.full_name) ELSE COALESCE(p.display_name, u.full_name) END AS full_name,
        u.email,
        CASE WHEN u.role = 'parent' THEN COALESCE(pcp.child_gender, u.gender) ELSE u.gender END AS gender,
        TIMESTAMPDIFF(YEAR, CASE WHEN u.role = 'parent' THEN COALESCE(pcp.child_date_of_birth, u.date_of_birth) ELSE u.date_of_birth END, CURDATE()) AS age,
        u.role,
        CASE WHEN u.role = 'parent' THEN CONCAT('Managed by ', COALESCE(u.parent_relationship, 'Family')) ELSE 'Self' END AS managed_by,

        p.profile_photo,
        p.city,
        p.state,
        p.education,
        p.occupation

      FROM interests i

      INNER JOIN users u
        ON u.id = i.receiver_user_id

      LEFT JOIN profiles p
        ON p.user_id = u.id

      LEFT JOIN parent_child_profiles pcp
        ON pcp.parent_user_id = u.id

      WHERE i.sender_user_id = ?
        AND (u.role IS NULL OR u.role != 'admin')

      ORDER BY i.created_at DESC
    `,
    [userId]
  );

  return rows.map(formatSentInterest);
}

async function updateInterestStatus(
  interestId,
  receiverUserId,
  status
) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      `
        SELECT
          id,
          sender_user_id,
          receiver_user_id,
          status,
          created_at,
          updated_at
        FROM interests
        WHERE id = ?
        LIMIT 1
        FOR UPDATE
      `,
      [interestId]
    );

    if (rows.length === 0) {
      const error = new Error(
        "Interest not found"
      );
      error.statusCode = 404;
      throw error;
    }

    const interest = rows[0];

    if (
      interest.receiver_user_id !==
      receiverUserId
    ) {
      const error = new Error(
        "You are not allowed to update this interest"
      );
      error.statusCode = 403;
      throw error;
    }

    if (interest.status !== "pending") {
      const error = new Error(
        `Interest is already ${interest.status}`
      );
      error.statusCode = 409;
      throw error;
    }

    await connection.execute(
      `
        UPDATE interests
        SET status = ?
        WHERE id = ?
      `,
      [status, interestId]
    );

    const [updatedRows] =
      await connection.execute(
        `
          SELECT
            id,
            sender_user_id,
            receiver_user_id,
            status,
            created_at,
            updated_at
          FROM interests
          WHERE id = ?
          LIMIT 1
        `,
        [interestId]
      );

    await connection.commit();

    // Trigger in-app notification for interest acceptance
    if (status === "accepted") {
      try {
        const [acceptorRows] = await pool.execute(
          "SELECT full_name FROM users WHERE id = ? LIMIT 1",
          [receiverUserId]
        );
        const acceptorName = acceptorRows[0]?.full_name || "Someone";

        await createNotification({
          userId: interest.sender_user_id,
          type: "interest_accepted",
          title: "Interest Accepted",
          message: `${acceptorName} accepted your interest.`,
          referenceId: receiverUserId,
        });
      } catch (notifErr) {
        console.error("Failed to create interest_accepted notification:", notifErr);
      }
    }

    return formatInterest(updatedRows[0]);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

function formatInterest(row) {
  return {
    id: row.id,
    senderUserId: row.sender_user_id,
    receiverUserId: row.receiver_user_id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function formatReceivedInterest(row) {
  return {
    id: row.id,

    senderUserId: row.sender_user_id,
    receiverUserId: row.receiver_user_id,

    status: row.status,

    createdAt: row.created_at,
    updatedAt: row.updated_at,

    user: {
      id: row.sender_user_id,
      fullName: row.full_name,
      email: row.email,
      gender: row.gender,
      age: row.age !== null ? Number(row.age) : null,
      role: row.role,
      managedBy: row.managed_by,

      profilePhoto: row.profile_photo,
      city: row.city,
      state: row.state,
      education: row.education,
      occupation: row.occupation,
    },
  };
}

function formatSentInterest(row) {
  return {
    id: row.id,

    senderUserId: row.sender_user_id,
    receiverUserId: row.receiver_user_id,

    status: row.status,

    createdAt: row.created_at,
    updatedAt: row.updated_at,

    user: {
      id: row.receiver_user_id,
      fullName: row.full_name,
      email: row.email,
      gender: row.gender,
      age: row.age !== null ? Number(row.age) : null,
      role: row.role,
      managedBy: row.managed_by,

      profilePhoto: row.profile_photo,
      city: row.city,
      state: row.state,
      education: row.education,
      occupation: row.occupation,
    },
  };
}

module.exports = {
  createInterest,
  getReceivedInterests,
  getSentInterests,
  updateInterestStatus,
};