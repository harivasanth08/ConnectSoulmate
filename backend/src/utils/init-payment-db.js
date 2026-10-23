const pool = require("../config/database");

async function initPaymentDatabase() {
  const connection = await pool.getConnection();

  try {
    console.log("Initializing payment database tables...");

    await connection.query(`
      CREATE TABLE IF NOT EXISTS subscription_plans (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price_paise INT UNSIGNED NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        duration_days INT UNSIGNED NOT NULL,
        features TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log("✓ subscription_plans table verified/created.");

    await connection.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        plan_id VARCHAR(50) NOT NULL,
        status ENUM('pending', 'active', 'expired', 'cancelled') DEFAULT 'pending',
        starts_at TIMESTAMP NULL,
        expires_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        CONSTRAINT fk_subscription_user
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

        CONSTRAINT fk_subscription_plan
          FOREIGN KEY (plan_id) REFERENCES subscription_plans(id),

        INDEX idx_subscription_user_status (user_id, status),
        INDEX idx_subscription_expires_at (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log("✓ subscriptions table verified/created.");

    await connection.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        subscription_id BIGINT UNSIGNED NULL,
        razorpay_order_id VARCHAR(255) NOT NULL,
        razorpay_payment_id VARCHAR(255) NULL,
        razorpay_signature VARCHAR(512) NULL,
        amount_paise INT UNSIGNED NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        status ENUM(
          'created',
          'authorized',
          'captured',
          'failed',
          'refunded'
        ) DEFAULT 'created',
        error_message TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        CONSTRAINT fk_payment_user
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

        CONSTRAINT fk_payment_subscription
          FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
          ON DELETE SET NULL,

        UNIQUE KEY uk_payment_order_id (razorpay_order_id),
        UNIQUE KEY uk_payment_payment_id (razorpay_payment_id),

        INDEX idx_payment_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log("✓ payments table verified/created.");

    const plans = [
      [
        "free",
        "Free Plan",
        0,
        "INR",
        0,
        "Standard search, 5 profile views/day, receive interests."
      ],
      [
        "premium_monthly",
        "Premium Monthly",
        49900,
        "INR",
        30,
        "Unlimited profile views, unlimited interests, direct messaging with matches, shortlist up to 100 profiles, Premium badge."
      ],
      [
        "premium_yearly",
        "Premium Yearly",
        399900,
        "INR",
        365,
        "All Monthly features, priority placement in search results, highlighted profile card."
      ]
    ];

    for (const plan of plans) {
      await connection.query(
        `
          INSERT INTO subscription_plans
            (id, name, price_paise, currency, duration_days, features)
          VALUES (?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            price_paise = VALUES(price_paise),
            currency = VALUES(currency),
            duration_days = VALUES(duration_days),
            features = VALUES(features);
        `,
        plan
      );
    }

    console.log("✓ Subscription plans verified/seeded.");
    console.log("Payment database initialization completed successfully.");
  } catch (error) {
    console.error("Error initializing payment database:", error);
    throw error;
  } finally {
    connection.release();
  }
}

if (require.main === module) {
  initPaymentDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { initPaymentDatabase };