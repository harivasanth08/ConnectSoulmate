const pool = require("../config/database");

async function initMessagingDatabase() {
  const connection = await pool.getConnection();

  try {
    console.log("Initializing messaging database tables...");

    await connection.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_one_id BIGINT UNSIGNED NOT NULL,
        user_two_id BIGINT UNSIGNED NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        CONSTRAINT fk_conv_user_one FOREIGN KEY (user_one_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_conv_user_two FOREIGN KEY (user_two_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT chk_canonical_user_order CHECK (user_one_id < user_two_id),
        UNIQUE KEY uk_user_pair (user_one_id, user_two_id),
        INDEX idx_user_two (user_two_id),
        INDEX idx_updated_at (updated_at DESC)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("✓ conversations table verified/created.");

    await connection.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        conversation_id BIGINT UNSIGNED NOT NULL,
        sender_user_id BIGINT UNSIGNED NOT NULL,
        message VARCHAR(2000) NOT NULL,
        is_read TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_msg_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
        CONSTRAINT fk_msg_sender FOREIGN KEY (sender_user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_conv_created (conversation_id, created_at DESC),
        INDEX idx_conv_unread (conversation_id, is_read, sender_user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("✓ messages table verified/created.");

    console.log("Messaging database initialization completed successfully.");
  } catch (error) {
    console.error("Error initializing messaging database:", error);
    throw error;
  } finally {
    connection.release();
  }
}

if (require.main === module) {
  initMessagingDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { initMessagingDatabase };
