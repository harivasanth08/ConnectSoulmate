const bcrypt = require("bcrypt");
const pool = require("../config/database");

/**
 * Idempotent provisioning of admin audit table and optional initial administrator account.
 * Reads administrator email and initial password from environment variables:
 * ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD.
 */
async function initAdminDatabase() {
  const connection = await pool.getConnection();

  try {
    console.log("Initializing Admin database schema and provisioning...");

    // 1. Create admin_audit_logs table if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_audit_logs (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        admin_user_id BIGINT UNSIGNED NOT NULL,
        action VARCHAR(100) NOT NULL,
        target_type VARCHAR(50) DEFAULT NULL,
        target_id BIGINT UNSIGNED DEFAULT NULL,
        metadata JSON DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_admin_user (admin_user_id),
        INDEX idx_action (action),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Provision Initial Admin Account (if configured in environment)
    const adminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim().toLowerCase() : null;
    const adminInitialPassword = process.env.ADMIN_INITIAL_PASSWORD ? String(process.env.ADMIN_INITIAL_PASSWORD) : null;

    if (!adminEmail || !adminInitialPassword) {
      console.log("Admin account initial provisioning skipped: ADMIN_EMAIL or ADMIN_INITIAL_PASSWORD not configured.");
    } else {
      const [existing] = await connection.execute(
        `SELECT id, role, account_status, email_verified_at FROM users WHERE email = ? LIMIT 1`,
        [adminEmail]
      );

      if (existing.length === 0) {
        const passwordHash = await bcrypt.hash(adminInitialPassword, 12);
        await connection.execute(
          `
          INSERT INTO users (
            full_name,
            email,
            mobile_number,
            gender,
            date_of_birth,
            password_hash,
            account_status,
            role,
            email_verified_at,
            terms_accepted,
            terms_accepted_at,
            terms_version,
            profile_completed
          )
          VALUES (
            'ConnectSoulmate Admin',
            ?,
            '9999900000',
            'other',
            '1990-01-01',
            ?,
            'active',
            'admin',
            NOW(),
            1,
            NOW(),
            '1.0',
            1
          )
          `,
          [adminEmail, passwordHash]
        );
        console.log("Initial administrator account provisioned successfully.");
      } else {
        const adminUser = existing[0];
        const updates = [];
        const params = [];

        // Note: Existing administrator password is never modified or reset on application startup.
        if (adminUser.role !== "admin") {
          updates.push("role = 'admin'");
        }

        if (adminUser.account_status !== "active") {
          updates.push("account_status = 'active'");
        }

        if (!adminUser.email_verified_at) {
          updates.push("email_verified_at = NOW()");
        }

        if (updates.length > 0) {
          params.push(adminUser.id);
          await connection.execute(
            `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
            params
          );
          console.log("Administrator account role and status verified.");
        } else {
          console.log("Administrator account verified and active.");
        }
      }
    }

    console.log("Admin database provisioning completed successfully.");
  } catch (error) {
    console.error("Failed to initialize Admin database schema:", error.message);
  } finally {
    connection.release();
  }
}

// Allow standalone execution
if (require.main === module) {
  initAdminDatabase()
    .then(() => {
      console.log("Admin DB initialization script finished.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Admin DB initialization script failed:", err);
      process.exit(1);
    });
}

module.exports = { initAdminDatabase };
