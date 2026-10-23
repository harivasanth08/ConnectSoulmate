const crypto = require("crypto");

const pool = require("../config/database");

async function verifyEmail(req, res) {
  const { token } = req.params;

  if (!token || !token.trim()) {
    return res.status(400).json({
      success: false,
      message: "Verification token is required",
    });
  }

  const cleanToken = token.trim();

  const tokenHash = crypto
    .createHash("sha256")
    .update(cleanToken)
    .digest("hex");

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [verificationRows] = await connection.execute(
      `
      SELECT
        id,
        user_id,
        expires_at,
        used_at
      FROM email_verifications
      WHERE token_hash = ?
      LIMIT 1
      `,
      [tokenHash]
    );

    if (verificationRows.length === 0) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Invalid verification link",
      });
    }

    const verification = verificationRows[0];

    if (verification.used_at !== null) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "This verification link has already been used",
      });
    }

    if (new Date(verification.expires_at) <= new Date()) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "This verification link has expired",
      });
    }

    await connection.execute(
      `
      UPDATE users
      SET email_verified_at = NOW(),
          account_status = 'active'
      WHERE id = ?
      `,
      [verification.user_id]
    );

    await connection.execute(
      `
      UPDATE email_verifications
      SET used_at = NOW()
      WHERE id = ?
      `,
      [verification.id]
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. Your account is now active!",
      emailVerified: true,
      accountStatus: "active",
    });
  } catch (error) {
    await connection.rollback();

    console.error("Email verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify email",
    });
  } finally {
    connection.release();
  }
}

module.exports = {
  verifyEmail,
};