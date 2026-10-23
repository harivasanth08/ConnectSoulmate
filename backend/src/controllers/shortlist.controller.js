const {
  getShortlists,
  addToShortlist,
  removeFromShortlist,
  getShortlistStatus,
} = require("../services/shortlist.service");

async function listShortlists(req, res) {
  try {
    const userId = req.user.userId;
    const shortlists = await getShortlists(userId);

    return res.status(200).json({
      success: true,
      shortlists,
    });
  } catch (error) {
    console.error("List shortlists error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch shortlisted profiles",
    });
  }
}

async function addShortlist(req, res) {
  try {
    const userId = req.user.userId;
    const targetUserId = Number(req.params.userId);

    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid target user ID is required",
      });
    }

    const result = await addToShortlist(userId, targetUserId);

    return res.status(200).json({
      success: true,
      message: "Profile added to shortlist successfully",
      ...result,
    });
  } catch (error) {
    console.error("Add shortlist error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to add profile to shortlist",
    });
  }
}

async function removeShortlist(req, res) {
  try {
    const userId = req.user.userId;
    const targetUserId = Number(req.params.userId);

    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid target user ID is required",
      });
    }

    const result = await removeFromShortlist(userId, targetUserId);

    return res.status(200).json({
      success: true,
      message: "Profile removed from shortlist successfully",
      ...result,
    });
  } catch (error) {
    console.error("Remove shortlist error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to remove profile from shortlist",
    });
  }
}

async function handleGetShortlistStatus(req, res) {
  try {
    const userId = req.user.userId;
    const targetUserId = Number(req.params.userId);

    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid target user ID is required",
      });
    }

    const isShortlisted = await getShortlistStatus(userId, targetUserId);

    return res.status(200).json({
      success: true,
      isShortlisted,
    });
  } catch (error) {
    console.error("Get shortlist status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check shortlist status",
    });
  }
}

module.exports = {
  listShortlists,
  addShortlist,
  removeShortlist,
  handleGetShortlistStatus,
};
