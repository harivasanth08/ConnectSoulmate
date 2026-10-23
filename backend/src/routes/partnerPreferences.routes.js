const express = require("express");

const {
  getMyPartnerPreferences,
  createMyPartnerPreferences,
  updateMyPartnerPreferences,
} = require("../controllers/partnerPreferences.controller");

const {
  authenticateToken,
} = require("../middleware/auth.middleware");

const router = express.Router();

router.get(
  "/me",
  authenticateToken,
  getMyPartnerPreferences
);

router.post(
  "/me",
  authenticateToken,
  createMyPartnerPreferences
);

router.put(
  "/me",
  authenticateToken,
  updateMyPartnerPreferences
);

module.exports = router;