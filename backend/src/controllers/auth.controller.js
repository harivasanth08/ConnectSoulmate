const {
  registerUser,
  loginUser,
  getCurrentUser,
  resendVerificationEmail,
} = require("../services/auth.service");

async function register(req, res) {
  try {
    const {
      fullName,
      email,
      mobileNumber,
      gender,
      dateOfBirth,
      password,
      confirmPassword,
      termsAccepted,
      role,
      parentRelationship,
    } = req.body;

    const isParent = role === "parent";
    let effectiveGender = gender;
    let effectiveDob = dateOfBirth;

    if (isParent) {
      if (
        !fullName ||
        !email ||
        !mobileNumber ||
        !password ||
        !confirmPassword ||
        !parentRelationship
      ) {
        return res.status(400).json({
          success: false,
          message: "Parent name, email, mobile number, relationship, and password are required.",
        });
      }

      const rel = (parentRelationship || "").toLowerCase();
      if (!effectiveGender) {
        effectiveGender = rel.includes("father")
          ? "male"
          : rel.includes("mother")
          ? "female"
          : "other";
      }
      if (!effectiveDob) {
        effectiveDob = "1975-01-01";
      }
    } else {
      if (
        !fullName ||
        !email ||
        !mobileNumber ||
        !gender ||
        !dateOfBirth ||
        !password ||
        !confirmPassword
      ) {
        return res.status(400).json({
          success: false,
          message: "All registration fields are required",
        });
      }
    }

    if (termsAccepted !== true && termsAccepted !== "true") {
      return res.status(400).json({
        success: false,
        message: "You must read and accept the Terms & Conditions to register.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedMobile = mobileNumber.trim();

    const result = await registerUser({
      fullName: fullName.trim(),
      email: normalizedEmail,
      mobileNumber: normalizedMobile,
      gender: effectiveGender,
      dateOfBirth: effectiveDob,
      password,
      role: isParent ? "parent" : "user",
      parentRelationship: isParent ? parentRelationship : null,
    });

    res.status(201).json({
      success: true,
      message:
        "Registration successful. Please verify your email to activate your account.",
      userId: result.userId,
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Unable to complete registration",
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const result = await loginUser(
      normalizedEmail,
      password
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Unable to complete login",
      requiresEmailVerification: Boolean(error.requiresEmailVerification),
      userId: error.userId || undefined,
      email: error.email || undefined,
    });
  }
}









async function getMe(req, res) {
  try {
    const user = await getCurrentUser(req.user.userId);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Unable to fetch user details",
    });
  }
}











async function resendEmail(req, res) {
  try {
    const { email, identifier, userId } = req.body || {};
    const targetIdentifier = email || identifier || userId;

    if (!targetIdentifier) {
      return res.status(400).json({
        success: false,
        message: "Email address or user ID is required",
      });
    }

    const result = await resendVerificationEmail(targetIdentifier);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Resend email verification error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to resend verification email",
    });
  }
}

module.exports = {
  register,
  login,
  getMe,
  resendEmail,
};