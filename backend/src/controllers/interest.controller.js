const {
  createInterest,
  getReceivedInterests,
  getSentInterests,
  updateInterestStatus,
} = require("../services/interest.service");

async function sendInterest(req, res) {
  try {
    const senderUserId = req.user.userId;
    const receiverUserId = Number(req.params.userId);

    if (!Number.isInteger(receiverUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const interest = await createInterest(
      senderUserId,
      receiverUserId
    );

    return res.status(201).json({
      success: true,
      message: "Interest sent successfully",
      interest,
    });
  } catch (error) {
    console.error("Send interest error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message || "Failed to send interest",
    });
  }
}

async function getMyReceivedInterests(req, res) {
  try {
    const userId = req.user.userId;

    const interests =
      await getReceivedInterests(userId);

    return res.status(200).json({
      success: true,
      interests,
    });
  } catch (error) {
    console.error(
      "Get received interests error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get received interests",
    });
  }
}

async function getMySentInterests(req, res) {
  try {
    const userId = req.user.userId;

    const interests =
      await getSentInterests(userId);

    return res.status(200).json({
      success: true,
      interests,
    });
  } catch (error) {
    console.error(
      "Get sent interests error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get sent interests",
    });
  }
}

async function acceptInterest(req, res) {
  try {
    const interestId = Number(
      req.params.interestId
    );

    if (!Number.isInteger(interestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interest ID",
      });
    }

    const interest =
      await updateInterestStatus(
        interestId,
        req.user.userId,
        "accepted"
      );

    return res.status(200).json({
      success: true,
      message: "Interest accepted successfully",
      interest,
    });
  } catch (error) {
    console.error(
      "Accept interest error:",
      error
    );

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message ||
        "Failed to accept interest",
    });
  }
}

async function rejectInterest(req, res) {
  try {
    const interestId = Number(
      req.params.interestId
    );

    if (!Number.isInteger(interestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interest ID",
      });
    }

    const interest =
      await updateInterestStatus(
        interestId,
        req.user.userId,
        "rejected"
      );

    return res.status(200).json({
      success: true,
      message: "Interest rejected successfully",
      interest,
    });
  } catch (error) {
    console.error(
      "Reject interest error:",
      error
    );

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message ||
        "Failed to reject interest",
    });
  }
}

module.exports = {
  sendInterest,
  getMyReceivedInterests,
  getMySentInterests,
  acceptInterest,
  rejectInterest,
};