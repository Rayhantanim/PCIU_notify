import emailjs from '@emailjs/browser';

// Initialize EmailJS with your Public Key
emailjs.init(process.env.REACT_APP_EMAILJS_PUBLIC_KEY);

export const sendBatchEmails = async (recipients, noticeData, audienceType) => {
    const response = await emailjs.send(
    process.env.REACT_APP_EMAILJS_SERVICE_ID,
    process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
    templateParams
  );
  const results = {
    success: [],
    failed: [],
    total: recipients.length
  };

  // Prepare email content
  const emailSubject = `📢 New ${noticeData.category} Notice: ${noticeData.title}`;
  const frontendUrl = process.env.REACT_APP_FRONTEND_URL || 'http://localhost:5173';
  
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0; color: white; text-align: center;">
        <h2 style="margin: 0;">📢 PCIU Notice Board</h2>
        <p style="margin: 5px 0 0;">New Notice Published for ${audienceType}</p>
      </div>
      <div style="padding: 20px;">
        <h3 style="color: #333; margin-top: 0;">${noticeData.title}</h3>
        <div style="color: #666; line-height: 1.6;">${noticeData.description}</div>
        <div style="background: #f5f5f5; padding: 10px; border-radius: 5px; margin-top: 20px;">
          <p style="margin: 5px 0;"><strong>Category:</strong> ${noticeData.category}</p>
          <p style="margin: 5px 0;"><strong>Priority:</strong> ${noticeData.priority || 'Normal'}</p>
          <p style="margin: 5px 0;"><strong>Posted by:</strong> ${noticeData.createdBy}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <a href="${frontendUrl}/dashboard/notices" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Notice
          </a>
        </div>
      </div>
      <div style="text-align: center; padding: 15px; background: #f9f9f9; border-radius: 0 0 10px 10px; color: #999; font-size: 12px;">
        <p>This is an automated notification from PCIU Notice Board.</p>
      </div>
    </div>
  `;

  // Send emails sequentially to avoid rate limiting
  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    
    try {
      const templateParams = {
        to_email: recipient.email,
        to_name: recipient.name,
        subject: emailSubject,
        html_content: emailHtml,
        from_name: "PCIU Notice Board",
        reply_to: noticeData.createdBy
      };

      const response = await emailjs.send(
        "YOUR_SERVICE_ID",     // Replace with your Service ID
        "YOUR_TEMPLATE_ID",    // Replace with your Template ID
        templateParams
      );
      
      results.success.push({
        email: recipient.email,
        name: recipient.name,
        response: response
      });
      
      console.log(`✅ Email sent to ${recipient.email} (${i + 1}/${recipients.length})`);
      
      // Add delay between sends to avoid rate limits (1 second)
      if (i < recipients.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error) {
      console.error(`❌ Failed to send email to ${recipient.email}:`, error);
      results.failed.push({
        email: recipient.email,
        name: recipient.name,
        error: error.text || error.message
      });
    }
  }

  return results;
};