require("dotenv").config();

const { sendVerificationEmail } = require("../services/email.service");

async function testEmail() {
  const recipient = process.env.SMTP_TEST_RECIPIENT || "test-recipient@example.com";
  try {
    await sendVerificationEmail(
      recipient,
      "test-verification-token"
    );

    console.log("Test email sent successfully.");
  } catch (error) {
    console.error("Email test failed:", error.message);
  }
}

testEmail();