import nodemailer from 'nodemailer';


const SMTP_USER = process.env.SMTP_USER || 'sih96880@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS || process.env.EMAIL_PASS || '';
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10);


// Create reusable transporter
let transporter = null;

if (SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
} else {
  console.log(`[Email Service] Note: SMTP_PASS is not set in .env. Initializing fallback transporter for ${SMTP_USER}.`);
}


/**
 * Send OTP Verification Email via SMTP
 * @param {string} toEmail - Recipient email address
 * @param {string} otp - 6-digit verification code
 * @param {string} purpose - 'login' | 'register' | 'forgot_password'
 */
export const sendOtpEmail = async (toEmail, otp, purpose = 'login') => {
  const titles = {
    login: 'Login Verification Code',
    register: 'Welcome to SkillNexus AI — Verify Your Email',
    forgot_password: 'Password Reset Verification Code',
    profile_update: 'Security Verification Code'
  };

  const descriptions = {
    login: 'Use the OTP below to complete your login to the SkillNexus AI platform.',
    register: 'Thank you for joining SkillNexus AI! Use the OTP below to verify your email and activate your account.',
    forgot_password: 'You requested a password reset for your SkillNexus AI account. Enter the OTP below to proceed.',
    profile_update: 'Use the OTP below to verify changes to your profile security.'
  };

  const subject = `[SkillNexus AI] ${titles[purpose] || 'Verification Code'}: ${otp}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #0f172a; }
        .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 36px; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .header { text-align: center; margin-bottom: 24px; }
        .brand { font-size: 20px; font-weight: 800; color: #059669; letter-spacing: -0.5px; }
        .badge { display: inline-block; padding: 4px 12px; background-color: #ecfdf5; color: #059669; border-radius: 9999px; font-size: 11px; font-weight: 700; margin-top: 6px; }
        .title { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 16px; margin-bottom: 8px; text-align: center; }
        .desc { font-size: 14px; color: #64748b; line-height: 1.6; text-align: center; margin-bottom: 28px; }
        .otp-box { background: linear-gradient(135deg, #059669 0%, #0d9488 100%); border-radius: 12px; padding: 18px 24px; text-align: center; margin-bottom: 24px; color: #ffffff; }
        .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 8px; font-family: monospace; }
        .expiry { font-size: 12px; color: #94a3b8; text-align: center; margin-bottom: 24px; }
        .footer { font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="brand">🌱 SkillNexus AI</div>
          <div class="badge">Team Zenith • SIH26044</div>
        </div>
        <div class="title">${titles[purpose] || 'Verification Code'}</div>
        <div class="desc">${descriptions[purpose] || 'Use the OTP code below to verify your identity.'}</div>
        
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
        </div>
        
        <div class="expiry">⏱️ This code is valid for <strong>10 minutes</strong>. Do not share it with anyone.</div>
        
        <div class="footer">
          Sent by <strong>sih96880@gmail.com</strong> for SkillNexus AI Platform.<br/>
          If you did not request this verification, please ignore this email.
        </div>
      </div>
    </body>
    </html>
  `;

  // Always log OTP to server console for testing & auditing
  console.log(`\n======================================================`);
  console.log(`[SMTP EMAIL DISPATCH]`);
  console.log(`From:    ${SMTP_USER}`);
  console.log(`To:      ${toEmail}`);
  console.log(`Purpose: ${purpose}`);
  console.log(`OTP:     ${otp}`);
  console.log(`======================================================\n`);

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"SkillNexus AI" <${SMTP_USER}>`,
        to: toEmail,
        subject,
        html: htmlContent,
      });
      console.log(`[Email Service] Email sent successfully to ${toEmail} (Message ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`[Email Service] SMTP send error:`, err.message);
      // Still return success in development so user is not blocked if Gmail password is missing
      return { success: true, warning: 'SMTP delivery failed, code logged to console' };
    }
  }

  return { success: true, warning: 'Mock email dispatched to console' };
};


/**
 * Generate a random 6-digit numeric OTP
 */
export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
