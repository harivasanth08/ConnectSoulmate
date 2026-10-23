async function sendOtpSms(mobileNumber, otp) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Production SMS service is not configured");
  }

  console.log("========================================");
  console.log("📱 ConnectSoulmate Development OTP");
  console.log(`Mobile: ${mobileNumber}`);
  console.log(`OTP: ${otp}`);
  console.log("========================================");

  return {
    success: true,
    development: true,
  };
}

module.exports = {
  sendOtpSms,
};