const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const pool = require("../config/database");

const { sendVerificationEmail } = require("./email.service");

const {
  generateVerificationToken,
  hashToken,
} = require("../utils/tokens");
const { logAdminAction } = require("./audit.service");

async function registerUser(userData) {
  const {
    fullName,
    email,
    mobileNumber,
    gender,
    dateOfBirth,
    password,
  } = userData;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existingUsers] = await connection.execute(
      `
      SELECT id, email, mobile_number
      FROM users
      WHERE email = ? OR mobile_number = ?
      LIMIT 1
      `,
      [email, mobileNumber]
    );

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];

      if (existingUser.email === email) {
        const error = new Error("Email is already registered");
        error.statusCode = 409;
        throw error;
      }

      if (existingUser.mobile_number === mobileNumber) {
        const error = new Error("Mobile number is already registered");
        error.statusCode = 409;
        throw error;
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const userRole = userData.role === "parent" ? "parent" : (userData.role || "user");
    const parentRelationship = userData.parentRelationship || null;

    const [userResult] = await connection.execute(
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
        parent_relationship,
        terms_accepted,
        terms_accepted_at,
        terms_version
      )
      VALUES (?, ?, ?, ?, ?, ?, 'pending_verification', ?, ?, 1, NOW(), '1.0')
      `,
      [
        fullName,
        email,
        mobileNumber,
        gender,
        dateOfBirth,
        passwordHash,
        userRole,
        parentRelationship,
      ]
    );

    const userId = userResult.insertId;

    const emailToken = generateVerificationToken();
    const emailTokenHash = hashToken(emailToken);

    await connection.execute(
      `
      INSERT INTO email_verifications (
        user_id,
        token_hash,
        expires_at
      )
      VALUES (
        ?,
        ?,
        DATE_ADD(NOW(), INTERVAL 30 MINUTE)
      )
      `,
      [userId, emailTokenHash]
    );

    await connection.commit();

    try {
      await sendVerificationEmail(email, emailToken);
      console.log(`Verification email sent to ${email}`);
    } catch (emailError) {
      console.error(
        `Failed to send verification email to ${email}:`,
        emailError.message
      );
    }

    return {
      userId,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function loginUser(email, password) {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.execute(
      `
      SELECT
        id,
        full_name,
        email,
        mobile_number,
        gender,
        date_of_birth,
        password_hash,
        role,
        parent_relationship,
        email_verified_at,
        mobile_verified_at,
        account_status,
        profile_completed,
        profile_completion_step
      FROM users
      WHERE email = ?
      LIMIT 1
      `,
      [email]
    );

    if (rows.length === 0) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    const user = rows[0];

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    if (!user.email_verified_at) {
      const error = new Error(
        "Please verify your email before logging in"
      );
      error.statusCode = 403;
      error.requiresEmailVerification = true;
      error.userId = user.id;
      error.email = user.email;
      throw error;
    }

    // Once email is verified, ensure account_status is active (in case user registered during legacy mobile OTP flow)
    if (user.account_status === "pending_verification") {
      await connection.execute(
        `UPDATE users SET account_status = 'active' WHERE id = ?`,
        [user.id]
      );
      user.account_status = "active";
    }

    if (user.account_status !== "active") {
      const error = new Error("Your account is not active");
      error.statusCode = 403;
      throw error;
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role || "user",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      }
    );

    let childProfile = null;
    if (user.role === "parent") {
      const [childRows] = await connection.execute(
        `SELECT id, child_name, child_relationship, child_gender, child_date_of_birth,
                TIMESTAMPDIFF(YEAR, child_date_of_birth, CURDATE()) AS child_age
         FROM parent_child_profiles WHERE parent_user_id = ? LIMIT 1`,
        [user.id]
      );
      if (childRows.length > 0) {
        const c = childRows[0];
        childProfile = {
          id: c.id,
          childName: c.child_name,
          childRelationship: c.child_relationship,
          childGender: c.child_gender,
          childDateOfBirth: c.child_date_of_birth,
          childAge: c.child_age !== null ? Number(c.child_age) : null,
        };
      }
    }

    if (String(user.role || "").toLowerCase() === "admin") {
      logAdminAction(user.id, "admin_login", "users", user.id, {
        email: user.email,
        loginTime: new Date().toISOString(),
      });
    }

    return {
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        mobileNumber: user.mobile_number,
        gender: user.gender,
        dateOfBirth: user.date_of_birth,
        accountStatus: user.account_status,
        role: user.role || "user",
        parentRelationship: user.parent_relationship || null,
        profileCompleted: Boolean(user.profile_completed),
        profileCompletionStep: user.profile_completion_step || 1,
        childProfile,
      },
    };
  } finally {
    connection.release();
  }
}

async function getCurrentUser(userId) {
  const connection = await pool.getConnection();

  try {
    const [rows] = await connection.execute(
      `
      SELECT
        id,
        full_name,
        email,
        mobile_number,
        gender,
        date_of_birth,
        role,
        parent_relationship,
        email_verified_at,
        mobile_verified_at,
        account_status,
        profile_completed,
        profile_completion_step
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [userId]
    );

    if (rows.length === 0) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const user = rows[0];

    if (user.account_status !== "active") {
      const error = new Error("Your account is not active");
      error.statusCode = 403;
      throw error;
    }

    let childProfile = null;
    if (user.role === "parent") {
      const [childRows] = await connection.execute(
        `SELECT id, child_name, child_relationship, child_gender, child_date_of_birth,
                TIMESTAMPDIFF(YEAR, child_date_of_birth, CURDATE()) AS child_age
         FROM parent_child_profiles WHERE parent_user_id = ? LIMIT 1`,
        [user.id]
      );
      if (childRows.length > 0) {
        const c = childRows[0];
        childProfile = {
          id: c.id,
          childName: c.child_name,
          childRelationship: c.child_relationship,
          childGender: c.child_gender,
          childDateOfBirth: c.child_date_of_birth,
          childAge: c.child_age !== null ? Number(c.child_age) : null,
        };
      }
    }

    return {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      mobileNumber: user.mobile_number,
      gender: user.gender,
      dateOfBirth: user.date_of_birth,
      accountStatus: user.account_status,
      role: user.role || "user",
      parentRelationship: user.parent_relationship || null,
      profileCompleted: Boolean(user.profile_completed),
      profileCompletionStep: user.profile_completion_step || 1,
      childProfile,
    };
  } finally {
    connection.release();
  }
}





async function resendVerificationEmail(identifier) {
  if (!identifier) {
    const error = new Error("Email address or user ID is required");
    error.statusCode = 400;
    throw error;
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const cleanIdentifier = String(identifier).trim().toLowerCase();
    const isNum = Number.isInteger(Number(cleanIdentifier)) && Number(cleanIdentifier) > 0;

    const [rows] = await connection.execute(
      `
      SELECT id, email, email_verified_at, account_status
      FROM users
      WHERE email = ? OR (id = ? AND ? = 1)
      LIMIT 1
      `,
      [cleanIdentifier, isNum ? Number(cleanIdentifier) : 0, isNum ? 1 : 0]
    );

    if (rows.length === 0) {
      const error = new Error("Account not found");
      error.statusCode = 404;
      throw error;
    }

    const user = rows[0];

    if (user.email_verified_at) {
      const error = new Error("Email is already verified");
      error.statusCode = 400;
      throw error;
    }

    // Invalidate previous unused verification tokens
    await connection.execute(
      `
      UPDATE email_verifications
      SET used_at = NOW()
      WHERE user_id = ? AND used_at IS NULL
      `,
      [user.id]
    );

    const emailToken = generateVerificationToken();
    const emailTokenHash = hashToken(emailToken);

    await connection.execute(
      `
      INSERT INTO email_verifications (
        user_id,
        token_hash,
        expires_at
      )
      VALUES (
        ?,
        ?,
        DATE_ADD(NOW(), INTERVAL 30 MINUTE)
      )
      `,
      [user.id, emailTokenHash]
    );

    await connection.commit();

    let emailSent = false;
    try {
      await sendVerificationEmail(user.email, emailToken);
      emailSent = true;
    } catch (emailError) {
      console.error(
        `Failed to send verification email to ${user.email}:`,
        emailError.message
      );
    }

    if (!emailSent) {
      const error = new Error(
        "Unable to send verification email right now. Please try again later."
      );
      error.statusCode = 500;
      throw error;
    }

    return {
      success: true,
      message: "Verification email sent successfully. Please check your inbox.",
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  resendVerificationEmail,
};