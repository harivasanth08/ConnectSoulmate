const pool = require("../config/database");

/**
 * Safe, idempotent database schema initialization for Parent / Family Mode.
 * Adds required columns and tables without disturbing existing data.
 */
async function initParentModeDatabase() {
  const connection = await pool.getConnection();

  try {
    console.log("Initializing Parent Mode database schema...");

    // 1. Add additive columns to users table
    const userCols = [
      "ALTER TABLE users ADD COLUMN parent_relationship VARCHAR(50) DEFAULT NULL",
    ];

    for (const sql of userCols) {
      try {
        await connection.execute(sql);
      } catch (err) {
        if (err.errno !== 1060 && !err.message.includes("Duplicate column")) {
          console.warn("Users table alter notice:", err.message);
        }
      }
    }

    // 2. Add additive columns to family_details table
    const familyCols = [
      "ALTER TABLE family_details ADD COLUMN about_family TEXT DEFAULT NULL",
    ];

    for (const sql of familyCols) {
      try {
        await connection.execute(sql);
      } catch (err) {
        if (err.errno !== 1060 && !err.message.includes("Duplicate column")) {
          console.warn("Family details table alter notice:", err.message);
        }
      }
    }

    // 3. Create parent_child_profiles table to link parent account to child matrimonial profile
    await connection.query(`
      CREATE TABLE IF NOT EXISTS parent_child_profiles (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        parent_user_id BIGINT UNSIGNED NOT NULL,
        child_name VARCHAR(100) NOT NULL,
        child_relationship VARCHAR(50) NOT NULL,
        child_gender ENUM('male', 'female', 'other') NOT NULL,
        child_date_of_birth DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        CONSTRAINT fk_pcp_parent FOREIGN KEY (parent_user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY uk_parent_child (parent_user_id),
        INDEX idx_child_gender (child_gender)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log("Parent Mode database schema initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Parent Mode database schema:", error.message);
  } finally {
    connection.release();
  }
}

module.exports = { initParentModeDatabase };
