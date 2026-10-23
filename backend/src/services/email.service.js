const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function sendVerificationEmail(email, token) {
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; color: #1f2937; }
          .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .header { text-align: center; padding-bottom: 24px; border-bottom: 1px solid #f3f4f6; }
          .brand { font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.5px; }
          .brand-accent { color: #db2777; }
          .content { padding: 24px 0; text-align: left; }
          .title { font-size: 20px; font-weight: 600; color: #111827; margin-bottom: 16px; }
          .text { font-size: 14px; line-height: 1.6; color: #4b5563; margin-bottom: 24px; }
          .btn-container { text-align: center; margin: 32px 0; }
          .btn { display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #7c3aed 0%, #db2777 100%); color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 12px rgba(219, 39, 119, 0.25); }
          .expiry-note { font-size: 12px; color: #9ca3af; text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #f3f4f6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="brand">Connect<span class="brand-accent">Soulmate</span></div>
          </div>
          <div class="content">
            <div class="title">Verify Your Email Address</div>
            <p class="text">Welcome to ConnectSoulmate! Please click the button below to verify your email address and activate your matrimonial account.</p>
            <div class="btn-container">
              <a href="${verificationUrl}" class="btn" target="_blank">Verify Email Address</a>
            </div>
            <p class="text" style="font-size: 12px; color: #6b7280;">If the button doesn't work, copy and paste this link into your browser:<br><a href="${verificationUrl}" style="color: #7c3aed; word-break: break-all;">${verificationUrl}</a></p>
          </div>
          <div class="expiry-note">
            This verification link will expire in 30 minutes.<br>If you did not create a ConnectSoulmate account, please ignore this email.
          </div>
        </div>
      </body>
    </html>
  `.trim();

  try {
    await transporter.sendMail({
      from: `"ConnectSoulmate" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Verify your ConnectSoulmate email address",
      text: `Welcome to ConnectSoulmate!\n\nPlease verify your email address by opening this link:\n\n${verificationUrl}\n\nThis link expires in 30 minutes.`,
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error("Nodemailer verification email send failed:", error.code || error.message);
    throw new Error(`SMTP email delivery failed: ${error.message}`);
  }
}

module.exports = {
  sendVerificationEmail,
};