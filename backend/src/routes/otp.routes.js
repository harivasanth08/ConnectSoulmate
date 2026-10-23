const express = require("express");
const rateLimit = require("express-rate-limit");

const { verifyOtp, resendOtp } = require("../controllers/otp.controller");

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many OTP verification requests. Please try again after 15 minutes.",
    });
  },
});

const resendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many OTP resend requests. Please try again after 15 minutes.",
    });
  },
});

const router = express.Router();

router.post("/verify", otpLimiter, verifyOtp);
router.post("/resend", resendLimiter, resendOtp);

module.exports = router;