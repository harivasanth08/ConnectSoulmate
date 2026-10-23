const pool = require("../config/database");

const { hashOtp, generateOtp } = require("../utils/tokens");

async function verifyMobileOtp(userId, otp) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      `
      SELECT
        id,
        otp_hash,
        expires_at,
        attempts,
        max_attempts,
        verified_at
      FROM mobile_otps
      WHERE user_id = ?
        AND purpose = 'registration'
      ORDER BY created_at DESC
      LIMIT 1
      FOR UPDATE
      `,
      [userId]
    );

    if (rows.length === 0) {
      const error = new Error("Invalid OTP");
      error.statusCode = 400;
      throw error;
    }

    const otpRecord = rows[0];

    if (otpRecord.verified_at) {
      const error = new Error("OTP has already been used");
      error.statusCode = 400;
      throw error;
    }

    if (new Date(otpRecord.expires_at) < new Date()) {
      const error = new Error("OTP has expired");
      error.statusCode = 400;
      throw error;
    }

    const maxAttempts = otpRecord.max_attempts || 5;

    if (otpRecord.attempts >= maxAttempts) {
      const error = new Error("Too many OTP attempts");
      error.statusCode = 429;
      throw error;
    }

    const otpHash = hashOtp(otp);

    if (otpHash !== otpRecord.otp_hash) {
      const newAttempts = otpRecord.attempts + 1;

      await connection.execute(
        `
        UPDATE mobile_otps
        SET attempts = ?
        WHERE id = ?
        `,
        [newAttempts, otpRecord.id]
      );

      await connection.commit();

      if (newAttempts >= maxAttempts) {
        const error = new Error("Too many OTP attempts");
        error.statusCode = 429;
        throw error;
      }

      const error = new Error("Invalid OTP");
      error.statusCode = 400;
      throw error;
    }

    await connection.execute(
      `
      UPDATE mobile_otps
      SET verified_at = NOW()
      WHERE id = ?
      `,
      [otpRecord.id]
    );

    await connection.execute(
      `
      UPDATE users
      SET mobile_verified_at = NOW()
      WHERE id = ?
      `,
      [userId]
    );

    const [userRows] = await connection.execute(
      `
      SELECT
        email_verified_at,
        mobile_verified_at
      FROM users
      WHERE id = ?
      `,
      [userId]
    );

    const user = userRows[0];

    if (user && user.email_verified_at && user.mobile_verified_at) {
      await connection.execute(
        `
        UPDATE users
        SET account_status = 'active'
        WHERE id = ?
        `,
        [userId]
      );
    }

    await connection.commit();

    return {
      success: true,
      message: "Mobile number verified successfully",
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function resendMobileOtp(userId) {
  if (!userId || !Number.isInteger(Number(userId))) {
    const error = new Error("Valid user ID is required");
    error.statusCode = 400;
    throw error;
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      `
      SELECT id, mobile_number, mobile_verified_at, account_status
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [Number(userId)]
    );

    if (rows.length === 0) {
      const error = new Error("User account not found");
      error.statusCode = 404;
      throw error;
    }

    const user = rows[0];

    if (user.mobile_verified_at) {
      const error = new Error("Mobile number is already verified");
      error.statusCode = 400;
      throw error;
    }

    // Invalidate previous active registration OTPs
    await connection.execute(
      `
      UPDATE mobile_otps
      SET expires_at = NOW()
      WHERE user_id = ? AND purpose = 'registration' AND verified_at IS NULL
      `,
      [user.id]
    );

    const otp = generateOtp();
    const otpHash = hashOtp(otp);

    await connection.execute(
      `
      INSERT INTO mobile_otps (
        user_id,
        mobile_number,
        otp_hash,
        purpose,
        attempts,
        max_attempts,
        expires_at
      )
      VALUES (
        ?,
        ?,
        ?,
        'registration',
        0,
        5,
        DATE_ADD(NOW(), INTERVAL 5 MINUTE)
      )
      `,
      [user.id, user.mobile_number, otpHash]
    );

    await connection.commit();

    try {
      const { sendOtpSms } = require("./sms.service");
      await sendOtpSms(user.mobile_number, otp);
    } catch (smsError) {
      console.error(`Failed to resend OTP SMS to ${user.mobile_number}:`, smsError.message);
    }

    return {
      success: true,
      message: "A new OTP has been sent to your registered mobile number.",
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  verifyMobileOtp,
  resendMobileOtp,
};