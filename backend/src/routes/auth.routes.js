const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  register,
  login,
  getMe,
  resendEmail,
} = require("../controllers/auth.controller");
const { resendOtp } = require("../controllers/otp.controller");

const { authenticateToken } = require("../middleware/auth.middleware");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many authentication requests. Please try again after 15 minutes.",
    });
  },
});

const resendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // max 3 resend requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many resend requests. Please try again after 15 minutes.",
    });
  },
});

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/me", authenticateToken, getMe);
router.post("/resend-verification-email", resendLimiter, resendEmail);
router.post("/resend-otp", resendLimiter, resendOtp);

module.exports = router;