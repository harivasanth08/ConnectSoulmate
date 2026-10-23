const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const pool = require("./src/config/database");

const authRoutes = require("./src/routes/auth.routes");
const emailRoutes = require("./src/routes/email.routes");
const otpRoutes = require("./src/routes/otp.routes");
const profileRoutes = require("./src/routes/profile.routes");
const familyRoutes = require("./src/routes/family.routes");
const partnerPreferencesRoutes = require(
  "./src/routes/partnerPreferences.routes"
);
const interestRoutes = require(
  "./src/routes/interest.routes"
);
const messageRoutes = require(
  "./src/routes/message.routes"
);
const shortlistRoutes = require(
  "./src/routes/shortlist.routes"
);
const subscriptionRoutes = require(
  "./src/routes/subscription.routes"
);
const aiRoutes = require("./src/routes/ai.routes");
const adminRoutes = require("./src/routes/admin.routes");
const notificationRoutes = require("./src/routes/notification.routes");
const kundaliRoutes = require("./src/routes/kundali.routes");
const onboardingRoutes = require("./src/routes/onboarding.routes");
const parentRoutes = require("./src/routes/parent.routes");

const notificationService = require("./src/services/notification.service");
notificationService.initNotificationTable();

const { initKundaliDatabase } = require("./src/utils/init-kundali-db");
initKundaliDatabase();

const { initOnboardingDatabase } = require("./src/utils/init-onboarding-db");
initOnboardingDatabase();

const { initParentModeDatabase } = require("./src/utils/init-parent-mode-db");
initParentModeDatabase();

const { initServicesDatabase } = require("./src/utils/init-services-db");
initServicesDatabase();

const { initAdminDatabase } = require("./src/utils/init-admin-db");
initAdminDatabase();

const serviceRoutes = require("./src/routes/services.routes");

const subscriptionController = require(
  "./src/controllers/subscription.controller"
);

const app = express();

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(helmet());
app.use(
  cors({
    origin: allowedOrigin,
    optionsSuccessStatus: 200,
  })
);

// Mount raw body handler for Razorpay Webhook BEFORE global express.json()
app.post(
  "/api/subscriptions/webhook",
  express.raw({ type: "application/json" }),
  subscriptionController.handleWebhook
);

app.use(express.json());

// Specific sub-routes mounted before general auth routes
app.use("/api/auth/email", emailRoutes);
app.use("/api/auth/otp", otpRoutes);
app.use("/api/auth", authRoutes);

// Specific profile sub-routes mounted before general profile routes
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/profile/family", familyRoutes);
app.use(
  "/api/profile/preferences",
  partnerPreferencesRoutes
);
app.use("/api/profile", profileRoutes);
app.use("/api/interests", interestRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/shortlists", shortlistRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/kundali", kundaliRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/parent", parentRoutes);
app.use("/api/services", serviceRoutes);

// Profile photo uploads
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader(
      "Cross-Origin-Resource-Policy",
      "cross-origin"
    );

    next();
  },
  express.static(path.join(__dirname, "uploads"))
);

app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS connected");

    res.status(200).json({
      success: true,
      message: "ConnectSoulmate API is running",
      database: rows[0].connected === 1,
    });
  } catch (error) {
    console.error(
      "Database health check failed:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// JSON 404 handler for API routes
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized JSON error handler
app.use((err, req, res, next) => {
  console.error("Unhandled API error:", err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`ConnectSoulmate API running on port ${PORT}`);
});