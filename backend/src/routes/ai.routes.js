const express = require("express");
const { getCompatibility } = require("../controllers/ai.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * GET /api/ai/compatibility/:targetUserId
 * Protected endpoint to fetch AI compatibility metrics between current user and target user
 */
router.get("/compatibility/:targetUserId", authenticateToken, getCompatibility);

module.exports = router;
