const nodemailer = require("nodemailer");

// Create email transporter
const createTransporter = () => {
  // For Gmail
  if (process.env.EMAIL_SERVICE === "gmail") {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use App Password, not regular password
      },
    });
  }
  
  // For Outlook/Hotmail
  if (process.env.EMAIL_SERVICE === "outlook") {
    return nodemailer.createTransport({
      service: "hotmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  
  // For custom SMTP (like SendGrid, Amazon SES, etc.)
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send OTP email for password reset
const sendOTPEmail = async (email, otp, userName) => {
  try {
    const transporter = createTransporter();
    
    // Verify connection
    await transporter.verify();
    
    const mailOptions = {
      from: `"PCI University" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP - PCI University",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset OTP</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 500px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 20px;
              border-radius: 10px 10px 0 0;
              color: white;
              text-align: center;
            }
            .content {
              background: white;
              padding: 30px;
              border: 1px solid #e0e0e0;
              border-top: none;
              border-radius: 0 0 10px 10px;
            }
            .otp-code {
              background: #f4f4f4;
              padding: 15px;
              text-align: center;
              font-size: 32px;
              letter-spacing: 5px;
              font-weight: bold;
              border-radius: 8px;
              margin: 20px 0;
              font-family: monospace;
            }
            .warning {
              background: #fff3cd;
              padding: 10px;
              border-radius: 5px;
              color: #856404;
              font-size: 12px;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #999;
            }
            button {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">🔐 Password Reset Request</h2>
            </div>
            <div class="content">
              <p>Hello <strong>${userName || 'User'}</strong>,</p>
              <p>We received a request to reset your password for your PCI University account.</p>
              <p>Use the following OTP (One-Time Password) to reset your password:</p>
              <div class="otp-code">
                ${otp}
              </div>
              <p>This OTP is valid for <strong>10 minutes</strong>.</p>
              <p>If you didn't request this, please ignore this email or contact support.</p>
              <div class="warning">
                ⚠️ <strong>Security Alert:</strong> Never share this OTP with anyone, including PCI University staff.
              </div>
              <div class="footer">
                <p>PCI University Notification System</p>
                <p>This is an automated message, please do not reply.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error: error.message };
  }
};

// Send password reset success email
const sendPasswordResetSuccessEmail = async (email, userName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"PCI University" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Successful - PCI University",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Successful</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 500px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
              padding: 20px;
              border-radius: 10px 10px 0 0;
              color: white;
              text-align: center;
            }
            .content {
              background: white;
              padding: 30px;
              border: 1px solid #e0e0e0;
              border-top: none;
              border-radius: 0 0 10px 10px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #999;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">✅ Password Reset Successful</h2>
            </div>
            <div class="content">
              <p>Hello <strong>${userName || 'User'}</strong>,</p>
              <p>Your password has been successfully reset.</p>
              <p>If you did not perform this action, please contact our support team immediately.</p>
              <p>You can now login with your new password.</p>
              <div class="footer">
                <p>PCI University Notification System</p>
                <p>This is an automated message, please do not reply.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Success email sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Success email sending error:", error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendOTPEmail, sendPasswordResetSuccessEmail };