// backend/services/emailService.js
const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Helper function to clean/minify HTML (optional)
const cleanHtml = (html) => {
  if (!html) return '';
  // Remove any script tags for security
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

const sendEmailNotification = async (recipient, notice, audienceLabel) => {
  const frontendUrl = process.env.FRONTEND_URL || 'https://pciunotify.vercel.app';
  
  // Ensure description is properly formatted
  const description = notice.description || 'No description provided';
  
  // Create a plain text version for email clients that don't support HTML
  const plainTextDescription = description.replace(/<[^>]*>/g, '');
  
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Notice: ${notice.title}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
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
        p { margin: 10px 0; }
        b, strong { font-weight: bold; }
        i, em { font-style: italic; }
        u { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">📢 PCIU Notice Board</h2>
          <p style="margin: 5px 0 0;">New Notice Published for ${audienceLabel}</p>
        </div>
        <div class="content">
          <h3 class="notice-title">${escapeHtml(notice.title)}</h3>
          <div class="notice-description">${description}</div>
          <div class="info-box">
            <div class="info-item"><strong>📂 Category:</strong> ${notice.category || 'General'}</div>
            <div class="info-item"><strong>⚡ Priority:</strong> ${notice.priority || 'Normal'}</div>
            <div class="info-item"><strong>👤 Posted by:</strong> ${notice.createdBy || 'Admin'}</div>
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

  // Also create a plain text version for email clients that prefer text
  const emailText = `
    PCIU NOTICE BOARD
    =================
    
    New Notice Published for ${audienceLabel}
    
    Title: ${notice.title}
    
    Description:
    ${plainTextDescription}
    
    Category: ${notice.category || 'General'}
    Priority: ${notice.priority || 'Normal'}
    Posted by: ${notice.createdBy || 'Admin'}
    Date: ${new Date().toLocaleString()}
    
    View this notice online: ${frontendUrl}/dashboard/notices
    
    ---
    This is an automated notification from PCIU Notice Board.
    Please do not reply to this email.
  `;

  const mailOptions = {
    from: `"PCIU Notice Board" <${process.env.EMAIL_USER}>`,
    to: recipient.email,
    subject: `📢 New ${notice.category || 'Notice'}: ${notice.title}`,
    html: emailHtml,
    text: emailText // Add plain text version as fallback
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${recipient.email}: ${info.messageId}`);
    return { success: true, email: recipient.email, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email to ${recipient.email}:`, error.message);
    return { success: false, email: recipient.email, error: error.message };
  }
};

// Helper function to escape HTML special characters
const escapeHtml = (text) => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const sendBulkEmails = async (recipients, notice, audienceLabel, onProgress) => {
  const results = {
    success: [],
    failed: [],
    total: recipients.length
  };

  console.log(`📧 Starting to send ${recipients.length} emails...`);

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    console.log(`📧 Sending email ${i + 1}/${recipients.length} to ${recipient.email}`);
    
    const result = await sendEmailNotification(recipient, notice, audienceLabel);
    
    if (result.success) {
      results.success.push(result);
    } else {
      results.failed.push(result);
    }
    
    if (onProgress) {
      onProgress(i + 1, recipients.length, results);
    }
    
    // Add delay to avoid rate limiting (Gmail allows ~100 emails per day)
    if (i < recipients.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
    }
  }

  console.log(`📧 Email sending complete: ${results.success.length} succeeded, ${results.failed.length} failed`);
  
  return results;
};

// Add a test function to verify email configuration
const testEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email transporter is configured correctly');
    return true;
  } catch (error) {
    console.error('❌ Email transporter configuration error:', error.message);
    return false;
  }
};

module.exports = { sendEmailNotification, sendBulkEmails, testEmailConfig };