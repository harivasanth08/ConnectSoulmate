const express = require("express");
const rateLimit = require("express-rate-limit");

const { verifyEmail } = require("../controllers/email.controller");
const { resendEmail } = require("../controllers/auth.controller");

const resendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
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

router.get("/verify/:token", verifyEmail);
router.post("/resend", resendLimiter, resendEmail);

module.exports = router;