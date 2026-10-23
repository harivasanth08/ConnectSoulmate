const Razorpay = require("razorpay");
const crypto = require("crypto");
const pool = require("../config/database");

function getRazorpayInstance() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    const error = new Error("Razorpay credentials are not configured in backend environment");
    error.statusCode = 500;
    throw error;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

/**
 * Fetch all available active subscription plans
 */
async function getPlans() {
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        name,
        price_paise,
        currency,
        duration_days,
        features,
        created_at
      FROM subscription_plans
      ORDER BY price_paise ASC
    `
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    pricePaise: row.price_paise,
    priceRupees: row.price_paise / 100,
    currency: row.currency || "INR",
    durationDays: row.duration_days,
    features: row.features,
    createdAt: row.created_at,
  }));
}

/**
 * Fetch current active non-expired subscription for a user.
 * Fallback to free plan format if no active paid subscription is found.
 */
async function getMySubscription(userId) {
  const [rows] = await pool.execute(
    `
      SELECT
        s.id AS subscription_id,
        s.user_id,
        s.plan_id,
        s.status,
        s.starts_at,
        s.expires_at,
        s.created_at,
        p.name AS plan_name,
        p.price_paise,
        p.currency,
        p.duration_days,
        p.features
      FROM subscriptions s
      INNER JOIN subscription_plans p ON p.id = s.plan_id
      WHERE s.user_id = ?
        AND s.status = 'active'
        AND s.expires_at > NOW()
      ORDER BY s.expires_at DESC
      LIMIT 1
    `,
    [userId]
  );

  if (rows.length > 0) {
    const row = rows[0];
    return {
      subscriptionId: row.subscription_id,
      userId: Number(row.user_id),
      planId: row.plan_id,
      planName: row.plan_name,
      status: row.status,
      startsAt: row.starts_at,
      expiresAt: row.expires_at,
      pricePaise: row.price_paise,
      currency: row.currency || "INR",
      durationDays: row.duration_days,
      features: row.features,
      isPremium: row.plan_id !== "free",
    };
  }

  // Fallback if no active paid subscription: fetch free plan structure
  const [freePlans] = await pool.execute(
    `SELECT * FROM subscription_plans WHERE id = 'free' LIMIT 1`
  );

  const freePlan = freePlans[0] || {
    id: "free",
    name: "Free Plan",
    price_paise: 0,
    currency: "INR",
    duration_days: 0,
    features: "Standard search, 5 profile views/day, receive interests.",
  };

  return {
    subscriptionId: null,
    userId: Number(userId),
    planId: freePlan.id,
    planName: freePlan.name,
    status: "active",
    startsAt: null,
    expiresAt: null,
    pricePaise: freePlan.price_paise,
    currency: freePlan.currency || "INR",
    durationDays: freePlan.duration_days,
    features: freePlan.features,
    isPremium: false,
  };
}

/**
 * Create a new Razorpay order for a specified planId
 */
async function createOrder(userId, planId) {
  if (!planId) {
    const error = new Error("Plan ID is required");
    error.statusCode = 400;
    throw error;
  }

  // 1. Fetch plan from DB (authoritative server-side pricing)
  const [plans] = await pool.execute(
    `SELECT * FROM subscription_plans WHERE id = ? LIMIT 1`,
    [planId]
  );

  if (plans.length === 0) {
    const error = new Error("Subscription plan not found");
    error.statusCode = 404;
    throw error;
  }

  const plan = plans[0];

  if (plan.price_paise <= 0 || plan.id === "free") {
    const error = new Error("Free plan does not require payment processing");
    error.statusCode = 400;
    throw error;
  }

  // 2. Check for recent existing unpaid created order (within 15 minutes) for idempotency
  const [existingPayments] = await pool.execute(
    `
      SELECT p.*, s.plan_id
      FROM payments p
      INNER JOIN subscriptions s ON p.subscription_id = s.id
      WHERE p.user_id = ?
        AND s.plan_id = ?
        AND p.status = 'created'
        AND p.created_at >= DATE_SUB(NOW(), INTERVAL 15 MINUTE)
      ORDER BY p.id DESC
      LIMIT 1
    `,
    [userId, planId]
  );

  if (existingPayments.length > 0) {
    const existing = existingPayments[0];
    return {
      orderId: existing.razorpay_order_id,
      amount: existing.amount_paise,
      currency: existing.currency || "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
      plan: {
        id: plan.id,
        name: plan.name,
        durationDays: plan.duration_days,
      },
    };
  }

  // 3. Create order using Razorpay TEST mode SDK
  const razorpay = getRazorpayInstance();
  const options = {
    amount: plan.price_paise,
    currency: plan.currency || "INR",
    receipt: `rcpt_${userId}_${Date.now()}`,
    notes: {
      userId: String(userId),
      planId: plan.id,
    },
  };

  let razorpayOrder;
  try {
    razorpayOrder = await razorpay.orders.create(options);
  } catch (err) {
    const error = new Error(`Razorpay order creation failed: ${err.message}`);
    error.statusCode = 502;
    throw error;
  }

  // 4. Save pending subscription & payment records in DB
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [subResult] = await connection.execute(
      `
        INSERT INTO subscriptions (user_id, plan_id, status)
        VALUES (?, ?, 'pending')
      `,
      [userId, plan.id]
    );

    const subscriptionId = subResult.insertId;

    await connection.execute(
      `
        INSERT INTO payments (
          user_id,
          subscription_id,
          razorpay_order_id,
          amount_paise,
          currency,
          status
        )
        VALUES (?, ?, ?, ?, ?, 'created')
      `,
      [
        userId,
        subscriptionId,
        razorpayOrder.id,
        plan.price_paise,
        plan.currency || "INR",
      ]
    );

    await connection.commit();

    return {
      orderId: razorpayOrder.id,
      amount: plan.price_paise,
      currency: plan.currency || "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
      plan: {
        id: plan.id,
        name: plan.name,
        durationDays: plan.duration_days,
      },
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Internal shared helper for processing captured payment & activating subscription.
 * Used by both verifyPayment (frontend flow) and processWebhookEvent (webhook flow).
 */
async function processPaymentCapture({
  razorpay_order_id,
  razorpay_payment_id = null,
  razorpay_signature = null,
  paymentAmount = null,
  userId = null,
}) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    let query = `
      SELECT p.*, s.plan_id
      FROM payments p
      INNER JOIN subscriptions s ON p.subscription_id = s.id
      WHERE p.razorpay_order_id = ?
    `;
    const params = [razorpay_order_id];

    if (userId) {
      query += ` AND p.user_id = ?`;
      params.push(userId);
    }

    query += ` FOR UPDATE`;

    const [payments] = await connection.execute(query, params);

    if (payments.length === 0) {
      await connection.rollback();
      connection.release();
      const error = new Error(`Payment order record not found for order_id: ${razorpay_order_id}`);
      error.statusCode = 404;
      throw error;
    }

    const payment = payments[0];
    const targetUserId = payment.user_id;

    // Idempotency check: if already captured, commit early and return current active subscription
    if (payment.status === "captured") {
      await connection.commit();
      connection.release();
      return {
        alreadyProcessed: true,
        subscription: await getMySubscription(targetUserId),
      };
    }

    // Fetch plan details to verify amount
    const [plans] = await connection.execute(
      `SELECT * FROM subscription_plans WHERE id = ? LIMIT 1`,
      [payment.plan_id]
    );

    if (plans.length === 0) {
      await connection.rollback();
      connection.release();
      const error = new Error("Associated subscription plan not found");
      error.statusCode = 404;
      throw error;
    }

    const plan = plans[0];

    // Verify amount match if paymentAmount provided
    if (
      payment.amount_paise !== plan.price_paise ||
      (paymentAmount !== null && paymentAmount !== plan.price_paise)
    ) {
      await connection.execute(
        `
          UPDATE payments
          SET status = 'failed', error_message = 'Payment amount mismatch'
          WHERE id = ?
        `,
        [payment.id]
      );
      await connection.commit();
      connection.release();
      const error = new Error("Payment amount mismatch");
      error.statusCode = 400;
      throw error;
    }

    // Fetch max active subscription expiry date for early renewal stacking
    const [activeExpiryRows] = await connection.execute(
      `
        SELECT MAX(expires_at) AS max_expires_at
        FROM subscriptions
        WHERE user_id = ?
          AND id != ?
          AND status = 'active'
          AND expires_at > NOW()
      `,
      [targetUserId, payment.subscription_id]
    );

    const maxExpiresAt = activeExpiryRows[0]?.max_expires_at || null;

    // Update payment record to captured
    await connection.execute(
      `
        UPDATE payments
        SET razorpay_payment_id = COALESCE(?, razorpay_payment_id),
            razorpay_signature = COALESCE(?, razorpay_signature),
            status = 'captured',
            error_message = NULL
        WHERE id = ?
      `,
      [razorpay_payment_id, razorpay_signature, payment.id]
    );

    // Update subscription to active with starts_at and stacked expires_at
    await connection.execute(
      `
        UPDATE subscriptions
        SET status = 'active',
            starts_at = IF(starts_at IS NULL, NOW(), starts_at),
            expires_at = DATE_ADD(GREATEST(IFNULL(?, NOW()), NOW()), INTERVAL ? DAY)
        WHERE id = ?
      `,
      [maxExpiresAt, plan.duration_days, payment.subscription_id]
    );

    // Expire older active subscriptions for this user except current one
    await connection.execute(
      `
        UPDATE subscriptions
        SET status = 'expired'
        WHERE user_id = ?
          AND id != ?
          AND status = 'active'
      `,
      [targetUserId, payment.subscription_id]
    );

    await connection.commit();
    connection.release();

    // Trigger in-app notification for subscriber
    try {
      const { createNotification } = require("./notification.service");
      await createNotification({
        userId: targetUserId,
        type: "subscription",
        title: "Subscription Activated",
        message: "Your Premium subscription is now active.",
        referenceId: payment.subscription_id,
      });
    } catch (notifErr) {
      console.error("Failed to create subscription notification:", notifErr);
    }

    return {
      alreadyProcessed: false,
      subscription: await getMySubscription(targetUserId),
    };
  } catch (error) {
    await connection.rollback();
    connection.release();
    throw error;
  }
}

/**
 * Verify Razorpay payment signature & update database status atomically
 */
async function verifyPayment(userId, paymentData) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    paymentData || {};

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    const error = new Error("Missing required payment verification parameters");
    error.statusCode = 400;
    throw error;
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    const error = new Error(
      "Razorpay credentials are not configured in backend environment"
    );
    error.statusCode = 500;
    throw error;
  }

  // 1. HMAC-SHA256 signature verification
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    await pool.execute(
      `
        UPDATE payments
        SET status = 'failed', error_message = 'Invalid HMAC-SHA256 signature'
        WHERE razorpay_order_id = ? AND user_id = ?
      `,
      [razorpay_order_id, userId]
    );

    const error = new Error("Payment verification failed: Invalid signature");
    error.statusCode = 400;
    throw error;
  }

  // 2. Fetch payment details from Razorpay API
  const razorpay = getRazorpayInstance();
  let razorpayPayment;
  try {
    razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);
  } catch (err) {
    const error = new Error(
      `Failed to fetch payment details from Razorpay: ${err.message}`
    );
    error.statusCode = 502;
    throw error;
  }

  // Strict Payment Capture Verification - ONLY "captured" status allowed
  if (!razorpayPayment || razorpayPayment.status !== "captured") {
    await pool.execute(
      `
        UPDATE payments
        SET status = 'failed', error_message = ?
        WHERE razorpay_order_id = ? AND user_id = ?
      `,
      [
        `Razorpay payment status is ${
          razorpayPayment ? razorpayPayment.status : "unknown"
        } (requires captured)`,
        razorpay_order_id,
        userId,
      ]
    );

    const error = new Error(
      `Payment is not in captured status (status: ${
        razorpayPayment ? razorpayPayment.status : "unknown"
      })`
    );
    error.statusCode = 400;
    throw error;
  }

  // 3. Process payment capture & activate subscription using shared helper
  const result = await processPaymentCapture({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    paymentAmount: razorpayPayment.amount,
    userId,
  });

  return result.subscription;
}

/**
 * Process incoming Razorpay webhook event securely using raw body bytes
 */
async function processWebhookEvent(rawBody, signature) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    const error = new Error(
      "RAZORPAY_WEBHOOK_SECRET is not configured in backend environment"
    );
    error.statusCode = 500;
    throw error;
  }

  if (!signature) {
    const error = new Error("Missing x-razorpay-signature header");
    error.statusCode = 400;
    throw error;
  }

  // Ensure rawBody is a Buffer or string
  const rawBodyBuffer = Buffer.isBuffer(rawBody)
    ? rawBody
    : Buffer.from(String(rawBody), "utf8");

  // 1. Verify Webhook HMAC-SHA256 signature using raw body bytes
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBodyBuffer)
    .digest("hex");

  let isValidSignature = false;
  try {
    isValidSignature = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "utf8"),
      Buffer.from(String(signature), "utf8")
    );
  } catch (e) {
    isValidSignature = false;
  }

  if (!isValidSignature) {
    const error = new Error("Invalid webhook signature");
    error.statusCode = 400;
    throw error;
  }

  // 2. Parse JSON payload from raw body bytes
  let eventPayload;
  try {
    eventPayload = JSON.parse(rawBodyBuffer.toString("utf8"));
  } catch (err) {
    const error = new Error("Invalid webhook JSON payload");
    error.statusCode = 400;
    throw error;
  }

  const eventType = eventPayload.event;
  const payload = eventPayload.payload || {};

  // Supported events: payment.captured, order.paid
  if (eventType === "payment.captured") {
    const paymentEntity = payload.payment?.entity;
    if (!paymentEntity) {
      return { success: true, message: "Ignored: Empty payment entity" };
    }

    if (paymentEntity.status !== "captured") {
      return {
        success: true,
        message: `Ignored: Payment status is ${paymentEntity.status}`,
      };
    }

    const orderId = paymentEntity.order_id;
    const paymentId = paymentEntity.id;
    const amountPaise = paymentEntity.amount;

    if (!orderId) {
      return { success: true, message: "Ignored: Payment has no order_id" };
    }

    const result = await processPaymentCapture({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      paymentAmount: amountPaise,
    });

    return {
      success: true,
      event: eventType,
      alreadyProcessed: result.alreadyProcessed,
      message: result.alreadyProcessed
        ? "Webhook event acknowledged (payment already captured)"
        : "Webhook event processed: Subscription activated successfully",
    };
  } else if (eventType === "order.paid") {
    const orderEntity = payload.order?.entity;
    const paymentEntity = payload.payment?.entity;

    const orderId = orderEntity?.id || paymentEntity?.order_id;
    const paymentId = paymentEntity?.id || null;
    const amountPaise = orderEntity?.amount || paymentEntity?.amount;

    if (!orderId) {
      return { success: true, message: "Ignored: Order event missing order_id" };
    }

    // Check if order payment is already captured
    const [payments] = await pool.execute(
      `SELECT status FROM payments WHERE razorpay_order_id = ? LIMIT 1`,
      [orderId]
    );

    if (payments.length > 0 && payments[0].status === "captured") {
      return {
        success: true,
        event: eventType,
        alreadyProcessed: true,
        message: "Webhook event acknowledged (order already paid/captured)",
      };
    }

    // If payment entity status is captured, process capture safely
    if (paymentEntity && paymentEntity.status === "captured") {
      const result = await processPaymentCapture({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        paymentAmount: amountPaise,
      });

      return {
        success: true,
        event: eventType,
        alreadyProcessed: result.alreadyProcessed,
        message: "Webhook event processed for order.paid",
      };
    }

    return {
      success: true,
      event: eventType,
      message: "Order.paid event acknowledged (waiting for payment.captured)",
    };
  }

  return {
    success: true,
    event: eventType,
    message: `Webhook event ${eventType} acknowledged (no action required)`,
  };
}

module.exports = {
  getPlans,
  getMySubscription,
  createOrder,
  verifyPayment,
  processWebhookEvent,
};
