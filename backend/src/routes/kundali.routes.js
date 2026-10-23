const express = require("express");
const {
  matchKundaliController,
  getCandidatesForMatchingController,
} = require("../controllers/kundali.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * POST /api/kundali/match
 * Compute Kundali compatibility between two persons based on birth details
 */
router.post("/match", matchKundaliController);

/**
 * GET /api/kundali/candidates
 * Fetch candidate options for logged-in user to quick-select Person 2
 */
router.get("/candidates", authenticateToken, getCandidatesForMatchingController);

module.exports = router;
