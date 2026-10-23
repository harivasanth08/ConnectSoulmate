/**
 * Obsolete Mobile OTP Controller
 * Mobile OTP verification functionality has been retired.
 * Account verification only requires email confirmation.
 */

async function verifyOtp(req, res) {
  return res.status(200).json({
    success: true,
    message: "Mobile verification is no longer required. Your account is verified via email.",
    accountStatus: "active",
  });
}

async function resendOtp(req, res) {
  return res.status(200).json({
    success: true,
    message: "Mobile OTP verification has been decommissioned. Only email verification is required.",
  });
}

module.exports = {
  verifyOtp,
  resendOtp,
};