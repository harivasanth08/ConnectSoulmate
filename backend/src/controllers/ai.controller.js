const aiService = require("../services/ai.service");

/**
 * GET /api/ai/compatibility/:targetUserId
 * Calculate AI profile compatibility for authenticated user against a target user
 */
async function getCompatibility(req, res) {
  try {
    const userId = req.user.userId;
    const targetUserId = Number(req.params.targetUserId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid target user ID is required",
      });
    }

    const compatibility = await aiService.getCompatibility(userId, targetUserId);

    return res.status(200).json({
      success: true,
      compatibility,
    });
  } catch (error) {
    console.error("AI Compatibility Controller error:", error.message);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to calculate AI compatibility",
    });
  }
}

module.exports = {
  getCompatibility,
};
