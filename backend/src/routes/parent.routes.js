const express = require("express");
const { authenticateToken } = require("../middleware/auth.middleware");
const {
  getOnboardingStateController,
  saveOnboardingStepController,
  completeOnboardingController,
  getDashboardController,
} = require("../controllers/parent.controller");

const router = express.Router();

router.get("/onboarding/state", authenticateToken, getOnboardingStateController);
router.post("/onboarding/step", authenticateToken, saveOnboardingStepController);
router.post("/onboarding/complete", authenticateToken, completeOnboardingController);
router.get("/dashboard", authenticateToken, getDashboardController);

module.exports = router;
