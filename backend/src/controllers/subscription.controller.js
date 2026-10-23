const subscriptionService = require("../services/subscription.service");

/**
 * Get all available active subscription plans
 * GET /api/subscriptions/plans (Public / Authenticated)
 */
async function getPlans(req, res) {
  try {
    const plans = await subscriptionService.getPlans();
    return res.status(200).json({
      success: true,
      plans,
    });
  } catch (error) {
    console.error("Get plans error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch subscription plans",
    });
  }
}

/**
 * Get active subscription status of the currently authenticated user
 * GET /api/subscriptions/me (Authenticated)
 */
async function getMySubscription(req, res) {
  try {
    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const subscription = await subscriptionService.getMySubscription(userId);
    return res.status(200).json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.error("Get my subscription error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch subscription details",
    });
  }
}

/**
 * Create Razorpay TEST order for purchasing a plan
 * POST /api/subscriptions/create-order (Authenticated)
 */
async function createOrder(req, res) {
  try {
    const userId = req.user.userId;
    const { planId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    if (!planId || typeof planId !== "string" || !planId.trim()) {
      return res.status(400).json({
        success: false,
        message: "Valid plan ID is required",
      });
    }

    const order = await subscriptionService.createOrder(userId, planId.trim());

    return res.status(200).json({
      success: true,
      message: "Razorpay payment order created successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to create payment order",
    });
  }
}

/**
 * Verify Razorpay payment signature and activate subscription
 * POST /api/subscriptions/verify (Authenticated)
 */
async function verifyPayment(req, res) {
  try {
    const userId = req.user.userId;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required payment parameters (razorpay_order_id, razorpay_payment_id, razorpay_signature are required)",
      });
    }

    const subscription = await subscriptionService.verifyPayment(userId, {
      razorpay_order_id: razorpay_order_id.trim(),
      razorpay_payment_id: razorpay_payment_id.trim(),
      razorpay_signature: razorpay_signature.trim(),
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified and subscription activated successfully",
      subscription,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Payment verification failed",
    });
  }
}

/**
 * Handle incoming Razorpay Webhook events (raw body bytes)
 * POST /api/subscriptions/webhook (Public, Signature Verified)
 */
async function handleWebhook(req, res) {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const rawBody = req.body; // Raw Buffer from express.raw()

    if (!rawBody) {
      return res.status(400).json({
        success: false,
        message: "Missing raw request body",
      });
    }

    const result = await subscriptionService.processWebhookEvent(
      rawBody,
      signature
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("Webhook processing error:", error.message);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Webhook processing failed",
    });
  }
}

module.exports = {
  getPlans,
  getMySubscription,
  createOrder,
  verifyPayment,
  handleWebhook,
};
