const pool = require("../config/database");

async function initOnboardingDatabase() {
  const connection = await pool.getConnection();

  try {
    console.log("Initializing onboarding database schema...");

    const userCols = [
      "ALTER TABLE users ADD COLUMN profile_completed TINYINT(1) NOT NULL DEFAULT 0",
      "ALTER TABLE users ADD COLUMN profile_completion_step INT NOT NULL DEFAULT 1",
    ];

    for (const sql of userCols) {
      try {
        await connection.execute(sql);
      } catch (err) {
        if (err.errno !== 1060 && !err.message.includes("Duplicate column")) {
          console.warn("User table alter notice:", err.message);
        }
      }
    }

    const profileCols = [
      "ALTER TABLE profiles ADD COLUMN display_name VARCHAR(100) DEFAULT NULL",
      "ALTER TABLE profiles ADD COLUMN looking_for VARCHAR(50) DEFAULT NULL",
      "ALTER TABLE profiles ADD COLUMN star_sign VARCHAR(50) DEFAULT NULL",
      "ALTER TABLE profiles ADD COLUMN languages_spoken TEXT DEFAULT NULL",
      "ALTER TABLE profiles ADD COLUMN interests_json TEXT DEFAULT NULL",
      "ALTER TABLE profiles ADD COLUMN hobbies_json TEXT DEFAULT NULL",
      "ALTER TABLE profiles ADD COLUMN weight_kg INT DEFAULT NULL",
      "ALTER TABLE profiles ADD COLUMN disability VARCHAR(50) DEFAULT NULL",
      "ALTER TABLE profiles ADD COLUMN disability_details TEXT DEFAULT NULL",
      "ALTER TABLE profiles ADD COLUMN employed_in VARCHAR(100) DEFAULT NULL",
      "ALTER TABLE profiles ADD COLUMN photos_json TEXT DEFAULT NULL",
    ];

    for (const sql of profileCols) {
      try {
        await connection.execute(sql);
      } catch (err) {
        if (err.errno !== 1060 && !err.message.includes("Duplicate column")) {
          console.warn("Profile table alter notice:", err.message);
        }
      }
    }

    const prefCols = [
      "ALTER TABLE partner_preferences ADD COLUMN other_notes TEXT DEFAULT NULL",
    ];

    for (const sql of prefCols) {
      try {
        await connection.execute(sql);
      } catch (err) {
        if (err.errno !== 1060 && !err.message.includes("Duplicate column")) {
          console.warn("Partner preferences alter notice:", err.message);
        }
      }
    }

    // Auto-mark existing active users who already have profiles as complete
    await connection.execute(`
      UPDATE users u
      LEFT JOIN profiles p ON p.user_id = u.id
      SET u.profile_completed = 1
      WHERE u.account_status = 'active'
        AND u.profile_completed = 0
        AND (p.city IS NOT NULL OR p.education IS NOT NULL OR p.occupation IS NOT NULL OR p.profile_photo IS NOT NULL)
    `);

    console.log("Onboarding database schema initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize onboarding database schema:", error.message);
  } finally {
    connection.release();
  }
}

module.exports = { initOnboardingDatabase };
