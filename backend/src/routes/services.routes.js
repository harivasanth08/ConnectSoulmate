const express = require("express");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");

const {
  listCategoriesController,
  getCategoryController,
  listServicesController,
  getServiceDetailsController,
  submitEnquiryController,
  listLocationsController,
} = require("../controllers/services.controller");

const router = express.Router();

/**
 * Optional authentication middleware.
 * If user passes Authorization header, decodes and attaches user to req.user.
 * If no header is provided, allows guest enquiry.
 */
function optionalAuthenticateToken(req, res, next) {
  const authorization = req.headers.authorization;
  if (!authorization) {
    req.user = null;
    return next();
  }

  const [scheme, token] = authorization.split(" ");
  if (scheme !== "Bearer" || !token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role || "user",
    };
    next();
  } catch (err) {
    // If token is invalid/expired, still allow guest enquiry but log for debugging
    req.user = null;
    next();
  }
}

// Rate limiter for enquiry submissions: max 20 enquiries per 15 minutes per IP
const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many enquiries sent from this network. Please wait a few minutes before trying again.",
  },
});

// Category endpoints
router.get("/categories", listCategoriesController);
router.get("/categories/:slug", getCategoryController);

// Locations endpoint
router.get("/locations", listLocationsController);

// Providers list & details
router.get("/", listServicesController);
router.get("/:id", getServiceDetailsController);

// Enquiry submission
router.post("/:id/enquiry", enquiryLimiter, optionalAuthenticateToken, submitEnquiryController);

module.exports = router;
