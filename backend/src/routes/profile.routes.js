const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const {
  getMyProfile,
  createMyProfile,
  updateMyProfile,
  uploadProfilePhoto,
  deleteMyProfilePhoto,
  searchProfilesController,
  getPublicProfileController,
} = require("../controllers/profile.controller");

const { authenticateToken } = require("../middleware/auth.middleware");

const router = express.Router();

const uploadDir = path.join(__dirname, "../../uploads/profile-photos");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${req.user.userId}-${crypto.randomBytes(16).toString("hex")}${extension}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },

  fileFilter: (req, file, cb) => {
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    const extension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      return cb(new Error("Please upload a JPG, PNG, or WebP image."));
    }

    cb(null, true);
  },
});

// Middleware wrapper for clean Multer error handling
const uploadSinglePhoto = (req, res, next) => {
  upload.single("profilePhoto")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "Image size must be 10 MB or smaller.",
        });
      }
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
          success: false,
          message: "Invalid upload request field.",
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || "File upload error.",
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || "Invalid file upload.",
      });
    }
    next();
  });
};

router.get("/search", authenticateToken, searchProfilesController);

router.get("/me", authenticateToken, getMyProfile);

router.post("/me", authenticateToken, createMyProfile);

router.put("/me", authenticateToken, updateMyProfile);

router.post(
  "/me/photo",
  authenticateToken,
  uploadSinglePhoto,
  uploadProfilePhoto
);

router.delete("/me/photo", authenticateToken, deleteMyProfilePhoto);

router.get("/:id", authenticateToken, getPublicProfileController);

module.exports = router;