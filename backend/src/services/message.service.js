const pool = require("../config/database");

async function checkMutualInterest(userId1, userId2) {
  const [rows] = await pool.execute(
    `
      SELECT id, status
      FROM interests
      WHERE ((sender_user_id = ? AND receiver_user_id = ?) OR (sender_user_id = ? AND receiver_user_id = ?))
        AND status = 'accepted'
      LIMIT 1
    `,
    [userId1, userId2, userId2, userId1]
  );

  return rows.length > 0;
}

async function getOrCreateConversation(currentUserId, targetUserId) {
  if (currentUserId === targetUserId) {
    const error = new Error("You cannot start a conversation with yourself");
    error.statusCode = 400;
    throw error;
  }

  const isMatched = await checkMutualInterest(currentUserId, targetUserId);
  if (!isMatched) {
    const error = new Error(
      "Messaging is only allowed between mutually accepted matches"
    );
    error.statusCode = 403;
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

  const userOneId = Math.min(currentUserId, targetUserId);
  const userTwoId = Math.max(currentUserId, targetUserId);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.execute(
      `
        INSERT INTO conversations (user_one_id, user_two_id)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)
      `,
      [userOneId, userTwoId]
    );

    const [convIdResult] = await connection.execute(`SELECT LAST_INSERT_ID() as id`);
    const conversationId = convIdResult[0].id;

    const [participantRows] = await connection.execute(
      `
        SELECT
          u.id,
          CASE WHEN u.role = 'parent' THEN COALESCE(pcp.child_name, p.display_name, u.full_name) ELSE COALESCE(p.display_name, u.full_name) END AS full_name,
          u.role,
          CASE WHEN u.role = 'parent' THEN CONCAT('Managed by ', COALESCE(u.parent_relationship, 'Family')) ELSE 'Self' END AS managed_by,
          u.email,
          p.profile_photo,
          p.city,
          p.state,
          p.occupation
        FROM users u
        LEFT JOIN profiles p ON p.user_id = u.id
        LEFT JOIN parent_child_profiles pcp ON pcp.parent_user_id = u.id
        WHERE u.id = ?
        LIMIT 1
      `,
      [targetUserId]
    );

    await connection.commit();

    const participant = participantRows[0]
      ? {
          id: participantRows[0].id,
          fullName: participantRows[0].full_name,
          role: participantRows[0].role,
          managedBy: participantRows[0].managed_by,
          email: participantRows[0].email,
          profilePhoto: participantRows[0].profile_photo,
          city: participantRows[0].city,
          state: participantRows[0].state,
          occupation: participantRows[0].occupation,
        }
      : null;

    return {
      conversationId: Number(conversationId),
      participant,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getUserConversations(currentUserId, limit = 20) {
  const parsedLimit = Math.min(Math.max(Number(limit) || 20, 1), 50);

  const [rows] = await pool.execute(
    `
      SELECT
        c.id AS conversation_id,
        c.user_one_id,
        c.user_two_id,
        c.updated_at,

        CASE WHEN c.user_one_id = ? THEN c.user_two_id ELSE c.user_one_id END AS partner_id,
        CASE WHEN u.role = 'parent' THEN COALESCE(pcp.child_name, p.display_name, u.full_name) ELSE COALESCE(p.display_name, u.full_name) END AS partner_full_name,
        u.role AS partner_role,
        CASE WHEN u.role = 'parent' THEN CONCAT('Managed by ', COALESCE(u.parent_relationship, 'Family')) ELSE 'Self' END AS partner_managed_by,
        p.profile_photo AS partner_profile_photo,
        p.city AS partner_city,
        p.state AS partner_state,
        p.occupation AS partner_occupation,

        m.id AS last_message_id,
        m.sender_user_id AS last_message_sender_id,
        m.message AS last_message_text,
        m.is_read AS last_message_is_read,
        m.created_at AS last_message_created_at,

        (
          SELECT COUNT(*)
          FROM messages msg
          WHERE msg.conversation_id = c.id
            AND msg.sender_user_id != ?
            AND msg.is_read = 0
        ) AS unread_count

      FROM conversations c

      INNER JOIN users u
        ON u.id = CASE WHEN c.user_one_id = ? THEN c.user_two_id ELSE c.user_one_id END

      LEFT JOIN profiles p
        ON p.user_id = u.id

      LEFT JOIN parent_child_profiles pcp
        ON pcp.parent_user_id = u.id

      LEFT JOIN messages m
        ON m.id = (
          SELECT max_m.id
          FROM messages max_m
          WHERE max_m.conversation_id = c.id
          ORDER BY max_m.id DESC
          LIMIT 1
        )

      WHERE c.user_one_id = ? OR c.user_two_id = ?

      ORDER BY c.updated_at DESC
      LIMIT ?
    `,
    [
      currentUserId,
      currentUserId,
      currentUserId,
      currentUserId,
      currentUserId,
      parsedLimit,
    ]
  );

  return rows.map((row) => ({
    id: row.conversation_id,
    participant: {
      id: row.partner_id,
      fullName: row.partner_full_name,
      role: row.partner_role,
      managedBy: row.partner_managed_by,
      profilePhoto: row.partner_profile_photo,
      city: row.partner_city,
      state: row.partner_state,
      occupation: row.partner_occupation,
    },
    lastMessage: row.last_message_id
      ? {
          id: row.last_message_id,
          senderUserId: row.last_message_sender_id,
          message: row.last_message_text,
          isRead: Boolean(row.last_message_is_read),
          createdAt: row.last_message_created_at,
        }
      : null,
    unreadCount: Number(row.unread_count || 0),
    updatedAt: row.updated_at,
  }));
}

async function getConversationMessages(
  conversationId,
  currentUserId,
  beforeId = null,
  limit = 20
) {
  const parsedLimit = Math.min(Math.max(Number(limit) || 20, 1), 50);

  const [convRows] = await pool.execute(
    `SELECT id, user_one_id, user_two_id FROM conversations WHERE id = ? LIMIT 1`,
    [conversationId]
  );

  if (convRows.length === 0) {
    const error = new Error("Conversation not found");
    error.statusCode = 404;
    throw error;
  }

  const conv = convRows[0];
  if (conv.user_one_id !== currentUserId && conv.user_two_id !== currentUserId) {
    const error = new Error("You are not authorized to view this conversation");
    error.statusCode = 403;
    throw error;
  }

  let query = `
    SELECT id, conversation_id, sender_user_id, message, is_read, created_at
    FROM messages
    WHERE conversation_id = ?
  `;
  const queryParams = [conversationId];

  if (beforeId && Number.isInteger(Number(beforeId))) {
    query += ` AND id < ?`;
    queryParams.push(Number(beforeId));
  }

  query += ` ORDER BY id DESC LIMIT ?`;
  queryParams.push(parsedLimit + 1);

  const [rows] = await pool.execute(query, queryParams);

  const hasMore = rows.length > parsedLimit;
  const rawMessages = hasMore ? rows.slice(0, parsedLimit) : rows;

  // Mark unread messages as read automatically when fetching
  await markMessagesAsReadInternal(conversationId, currentUserId);

  const messages = rawMessages.reverse().map((msg) => ({
    id: msg.id,
    conversationId: msg.conversation_id,
    senderUserId: msg.sender_user_id,
    message: msg.message,
    isRead: msg.sender_user_id === currentUserId ? Boolean(msg.is_read) : true,
    createdAt: msg.created_at,
  }));

  return {
    messages,
    hasMore,
  };
}

async function sendMessage(conversationId, senderUserId, messageText) {
  const trimmedMessage = (messageText || "").trim();

  if (!trimmedMessage) {
    const error = new Error("Message text cannot be empty");
    error.statusCode = 400;
    throw error;
  }

  if (trimmedMessage.length > 2000) {
    const error = new Error("Message exceeds maximum length of 2000 characters");
    error.statusCode = 400;
    throw error;
  }

  const [convRows] = await pool.execute(
    `SELECT id, user_one_id, user_two_id FROM conversations WHERE id = ? LIMIT 1`,
    [conversationId]
  );

  if (convRows.length === 0) {
    const error = new Error("Conversation not found");
    error.statusCode = 404;
    throw error;
  }

  const conv = convRows[0];
  if (conv.user_one_id !== senderUserId && conv.user_two_id !== senderUserId) {
    const error = new Error("You are not authorized to send messages in this conversation");
    error.statusCode = 403;
    throw error;
  }

  const recipientUserId =
    conv.user_one_id === senderUserId ? conv.user_two_id : conv.user_one_id;

  const isMatched = await checkMutualInterest(senderUserId, recipientUserId);
  if (!isMatched) {
    const error = new Error(
      "Messaging is disabled because mutual match status is no longer active"
    );
    error.statusCode = 403;
    throw error;
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [insertResult] = await connection.execute(
      `
        INSERT INTO messages (conversation_id, sender_user_id, message, is_read)
        VALUES (?, ?, ?, 0)
      `,
      [conversationId, senderUserId, trimmedMessage]
    );

    await connection.execute(
      `
        UPDATE conversations
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [conversationId]
    );

    const messageId = insertResult.insertId;

    const [msgRows] = await connection.execute(
      `
        SELECT id, conversation_id, sender_user_id, message, is_read, created_at
        FROM messages
        WHERE id = ?
        LIMIT 1
      `,
      [messageId]
    );

    await connection.commit();

    // Trigger in-app notification for recipient
    try {
      const [senderRows] = await pool.execute(
        "SELECT full_name FROM users WHERE id = ? LIMIT 1",
        [senderUserId]
      );
      const senderName = senderRows[0]?.full_name || "Someone";

      const { createNotification } = require("./notification.service");
      await createNotification({
        userId: recipientUserId,
        type: "new_message",
        title: "New Message",
        message: `${senderName} sent you a new message.`,
        referenceId: conversationId,
      });
    } catch (notifErr) {
      console.error("Failed to create new_message notification:", notifErr);
    }

    const msg = msgRows[0];
    return {
      id: msg.id,
      conversationId: msg.conversation_id,
      senderUserId: msg.sender_user_id,
      message: msg.message,
      isRead: Boolean(msg.is_read),
      createdAt: msg.created_at,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function markMessagesAsReadInternal(conversationId, recipientUserId) {
  await pool.execute(
    `
      UPDATE messages
      SET is_read = 1
      WHERE conversation_id = ?
        AND sender_user_id != ?
        AND is_read = 0
    `,
    [conversationId, recipientUserId]
  );
}

async function markMessagesAsRead(conversationId, recipientUserId) {
  const [convRows] = await pool.execute(
    `SELECT id, user_one_id, user_two_id FROM conversations WHERE id = ? LIMIT 1`,
    [conversationId]
  );

  if (convRows.length === 0) {
    const error = new Error("Conversation not found");
    error.statusCode = 404;
    throw error;
  }

  const conv = convRows[0];
  if (conv.user_one_id !== recipientUserId && conv.user_two_id !== recipientUserId) {
    const error = new Error("You are not authorized to update this conversation");
    error.statusCode = 403;
    throw error;
  }

  const [result] = await pool.execute(
    `
      UPDATE messages
      SET is_read = 1
      WHERE conversation_id = ?
        AND sender_user_id != ?
        AND is_read = 0
    `,
    [conversationId, recipientUserId]
  );

  return { affectedRows: result.affectedRows };
}

async function getUnreadMessageCount(userId) {
  const [rows] = await pool.execute(
    `
      SELECT COUNT(*) AS total_unread
      FROM messages m
      INNER JOIN conversations c ON c.id = m.conversation_id
      WHERE (c.user_one_id = ? OR c.user_two_id = ?)
        AND m.sender_user_id != ?
        AND m.is_read = 0
    `,
    [userId, userId, userId]
  );

  return Number(rows[0].total_unread || 0);
}

module.exports = {
  checkMutualInterest,
  getOrCreateConversation,
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  getUnreadMessageCount,
};
