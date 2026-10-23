const express = require("express");

const {
  sendInterest,
  getMyReceivedInterests,
  getMySentInterests,
  acceptInterest,
  rejectInterest,
} = require("../controllers/interest.controller");

const {
  authenticateToken,
} = require("../middleware/auth.middleware");

const router = express.Router();

router.post(
  "/:userId",
  authenticateToken,
  sendInterest
);

router.get(
  "/received",
  authenticateToken,
  getMyReceivedInterests
);

router.get(
  "/sent",
  authenticateToken,
  getMySentInterests
);

router.put(
  "/:interestId/accept",
  authenticateToken,
  acceptInterest
);

router.put(
  "/:interestId/reject",
  authenticateToken,
  rejectInterest
);

module.exports = router;