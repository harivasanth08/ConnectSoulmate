const express = require("express");

const {
  getPlans,
  getMySubscription,
  createOrder,
  verifyPayment,
  handleWebhook,
} = require("../controllers/subscription.controller");

const { authenticateToken } = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * GET /api/subscriptions/plans
 * Public endpoint to view available active subscription plans
 */
router.get("/plans", getPlans);

/**
 * GET /api/subscriptions/me
 * Protected endpoint to fetch current user's active subscription status
 */
router.get("/me", authenticateToken, getMySubscription);

/**
 * POST /api/subscriptions/create-order
 * Protected endpoint to create a Razorpay TEST order for purchasing a plan
 */
router.post("/create-order", authenticateToken, createOrder);

/**
 * POST /api/subscriptions/verify
 * Protected endpoint to verify Razorpay payment signature & activate subscription
 */
router.post("/verify", authenticateToken, verifyPayment);

/**
 * POST /api/subscriptions/webhook
 * Public endpoint to receive Razorpay webhook notifications using raw body bytes
 */
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);

module.exports = router;
