const pool = require("../config/database");

async function initShortlistDatabase() {
  const connection = await pool.getConnection();

  try {
    console.log("Initializing shortlist database tables...");

    await connection.query(`
      CREATE TABLE IF NOT EXISTS shortlists (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        shortlisted_user_id BIGINT UNSIGNED NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_shortlist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_shortlist_target FOREIGN KEY (shortlisted_user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT chk_no_self_shortlist CHECK (user_id <> shortlisted_user_id),
        UNIQUE KEY uk_user_shortlist (user_id, shortlisted_user_id),
        INDEX idx_shortlisted_target (shortlisted_user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("✓ shortlists table verified/created.");

    console.log("Shortlist database initialization completed successfully.");
  } catch (error) {
    console.error("Error initializing shortlist database:", error);
    throw error;
  } finally {
    connection.release();
  }
}

if (require.main === module) {
  initShortlistDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { initShortlistDatabase };
