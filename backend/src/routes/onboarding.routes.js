const express = require("express");
const { authenticateToken } = require("../middleware/auth.middleware");
const { getState, saveStep, complete } = require("../controllers/onboarding.controller");

const router = express.Router();

router.get("/state", authenticateToken, getState);
router.post("/step", authenticateToken, saveStep);
router.post("/complete", authenticateToken, complete);

module.exports = router;
