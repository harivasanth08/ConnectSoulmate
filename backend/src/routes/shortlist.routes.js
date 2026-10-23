const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  listShortlists,
  addShortlist,
  removeShortlist,
  handleGetShortlistStatus,
} = require("../controllers/shortlist.controller");

const { authenticateToken } = require("../middleware/auth.middleware");

const router = express.Router();

const shortlistActionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // max 60 actions per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many shortlist requests. Please slow down.",
  },
});

router.use(authenticateToken);

router.get("/", listShortlists);
router.get("/:userId/status", handleGetShortlistStatus);
router.post("/:userId", shortlistActionLimiter, addShortlist);
router.delete("/:userId", shortlistActionLimiter, removeShortlist);

module.exports = router;
