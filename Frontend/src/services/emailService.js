// backend/services/emailService.js
const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS  // Your email password or app password
  }
});

const sendEmailNotification = async (recipient, notice, audienceLabel) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Notice: ${notice.title}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0; color: white; text-align: center; }
        .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; }
        .notice-title { color: #333; margin-top: 0; font-size: 24px; }
        .notice-description { color: #666; line-height: 1.8; margin: 20px 0; }
        .info-box { background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .info-item { margin: 8px 0; }
        .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
        ul, ol { margin: 10px 0; padding-left: 20px; }
        li { margin: 5px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">📢 PCIU Notice Board</h2>
          <p style="margin: 5px 0 0;">New Notice Published for ${audienceLabel}</p>
        </div>
        <div class="content">
          <h3 class="notice-title">${notice.title}</h3>
          <div class="notice-description">${notice.description}</div>
          <div class="info-box">
            <div class="info-item"><strong>📂 Category:</strong> ${notice.category}</div>
            <div class="info-item"><strong>⚡ Priority:</strong> ${notice.priority || 'Normal'}</div>
            <div class="info-item"><strong>👤 Posted by:</strong> ${notice.createdBy}</div>
            <div class="info-item"><strong>📅 Date:</strong> ${new Date().toLocaleString()}</div>
          </div>
          <div style="text-align: center;">
            <a href="${frontendUrl}/dashboard/notices" class="btn">View Notice</a>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated notification from PCIU Notice Board.</p>
          <p>Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"PCIU Notice Board" <${process.env.EMAIL_USER}>`,
    to: recipient.email,
    subject: `📢 New ${notice.category} Notice: ${notice.title}`,
    html: emailHtml
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, email: recipient.email };
  } catch (error) {
    console.error(`Failed to send email to ${recipient.email}:`, error);
    return { success: false, email: recipient.email, error: error.message };
  }
};

const sendBulkEmails = async (recipients, notice, audienceLabel, onProgress) => {
  const results = {
    success: [],
    failed: [],
    total: recipients.length
  };

  for (let i = 0; i < recipients.length; i++) {
    const result = await sendEmailNotification(recipients[i], notice, audienceLabel);
    
    if (result.success) {
      results.success.push(result);
    } else {
      results.failed.push(result);
    }
    
    if (onProgress) {
      onProgress(i + 1, recipients.length, results);
    }
    
    // Add delay to avoid rate limiting
    if (i < recipients.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
};

module.exports = { sendEmailNotification, sendBulkEmails };