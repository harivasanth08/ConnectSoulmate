const express = require("express");

const {
  getMyFamilyDetails,
  createMyFamilyDetails,
  updateMyFamilyDetails,
} = require("../controllers/family.controller");

const {
  authenticateToken,
} = require("../middleware/auth.middleware");

const router = express.Router();

router.get(
  "/me",
  authenticateToken,
  getMyFamilyDetails
);

router.post(
  "/me",
  authenticateToken,
  createMyFamilyDetails
);

router.put(
  "/me",
  authenticateToken,
  updateMyFamilyDetails
);

module.exports = router;