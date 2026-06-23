const nodemailer = require('nodemailer');
const EmailLog = require('../models/EmailLog');
require('dotenv').config();

// Configure your email service
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Email templates
const emailTemplates = {
  job_match: {
    subject: 'New Job Match Found!',
    template: (data) => `
      <h2>New Job Opportunity!</h2>
      <p>Hi ${data.userName},</p>
      <p>We found a job that matches your profile: <strong>${data.jobTitle}</strong></p>
      <p>Company: ${data.companyName}</p>
      <p>Location: ${data.location}</p>
      <p><a href="${data.jobLink}">View Job</a></p>
    `
  },
  application_confirmation: {
    subject: 'Application Submitted Successfully',
    template: (data) => `
      <h2>Application Confirmed</h2>
      <p>Hi ${data.userName},</p>
      <p>Your application for <strong>${data.jobTitle}</strong> has been submitted successfully.</p>
      <p>We'll notify you when the employer responds.</p>
    `
  },
  interview_scheduled: {
    subject: 'Interview Scheduled',
    template: (data) => `
      <h2>Interview Scheduled</h2>
      <p>Hi ${data.userName},</p>
      <p>Your interview for <strong>${data.jobTitle}</strong> has been scheduled.</p>
      <p>Date & Time: ${data.interviewDateTime}</p>
      <p>Location: ${data.interviewLocation}</p>
      <p><a href="${data.interviewLink}">Join Interview</a></p>
    `
  },
  password_reset: {
    subject: 'Password Reset Request',
    template: (data) => `
      <h2>Password Reset</h2>
      <p>Hi ${data.userName},</p>
      <p>Click the link below to reset your password:</p>
      <p><a href="${data.resetLink}">Reset Password</a></p>
      <p>This link expires in 1 hour.</p>
    `
  },
  welcome: {
    subject: 'Welcome to Job Portal',
    template: (data) => `
      <h2>Welcome!</h2>
      <p>Hi ${data.userName},</p>
      <p>Thank you for joining our job portal. Your account has been created successfully.</p>
      <p><a href="${data.platformLink}">Get Started</a></p>
    `
  },
  subscription_confirmation: {
    subject: 'Subscription Confirmed',
    template: (data) => `
      <h2>Subscription Confirmed</h2>
      <p>Hi ${data.userName},</p>
      <p>Your subscription to <strong>${data.planName}</strong> has been confirmed.</p>
      <p>Valid until: ${data.expiryDate}</p>
    `
  },
  message_notification: {
    subject: 'New Message Received',
    template: (data) => `
      <h2>New Message</h2>
      <p>Hi ${data.userName},</p>
      <p>You have a new message from <strong>${data.senderName}</strong>:</p>
      <p><em>${data.messagePreview}</em></p>
      <p><a href="${data.messageLink}">View Message</a></p>
    `
  },
  payment_receipt: {
    subject: 'Payment Receipt',
    template: (data) => `
      <h2>Payment Receipt</h2>
      <p>Hi ${data.userName},</p>
      <p>Thank you for your payment.</p>
      <p>Amount: ${data.amount}</p>
      <p>Transaction ID: ${data.transactionId}</p>
    `
  }
};

// Send email function
exports.sendEmail = async (to, type, data) => {
  try {
    const template = emailTemplates[type];
    
    if (!template) {
      throw new Error(`Email template '${type}' not found`);
    }

    const emailContent = template.template(data);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: template.subject,
      html: emailContent
    };

    // Create email log
    const emailLog = new EmailLog({
      recipient: to,
      user: data.userId || null,
      subject: template.subject,
      type,
      status: 'pending',
      template: type,
      data
    });

    await emailLog.save();

    // Send email
    const info = await transporter.sendMail(mailOptions);

    // Update email log
    emailLog.status = 'sent';
    emailLog.sentAt = new Date();
    await emailLog.save();

    return {
      success: true,
      messageId: info.messageId,
      emailLogId: emailLog._id
    };
  } catch (error) {
    console.error('Email sending error:', error);

    // Log error
    const emailLog = new EmailLog({
      recipient: to,
      subject: emailTemplates[type]?.subject || type,
      type,
      status: 'failed',
      template: type,
      data,
      error: error.message
    });

    await emailLog.save();

    return {
      success: false,
      error: error.message,
      emailLogId: emailLog._id
    };
  }
};

// Send bulk emails
exports.sendBulkEmails = async (recipients, type, data) => {
  try {
    const results = [];

    for (const recipient of recipients) {
      const result = await exports.sendEmail(recipient, type, { ...data, userName: recipient.split('@')[0] });
      results.push(result);
    }

    return results;
  } catch (error) {
    console.error('Bulk email sending error:', error);
    return [];
  }
};

// Retry failed emails
exports.retryFailedEmails = async () => {
  try {
    const failedEmails = await EmailLog.find({
      status: 'failed',
      retryCount: { $lt: 3 }
    });

    for (const emailLog of failedEmails) {
      if (emailLog.retryCount < 3) {
        emailLog.retryCount += 1;
        const result = await exports.sendEmail(emailLog.recipient, emailLog.type, emailLog.data);
        
        if (result.success) {
          emailLog.status = 'sent';
          emailLog.sentAt = new Date();
        }
        
        await emailLog.save();
      }
    }

    return {
      success: true,
      message: 'Retry completed'
    };
  } catch (error) {
    console.error('Retry failed emails error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get email logs
exports.getEmailLogs = async (filter = {}) => {
  try {
    const logs = await EmailLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(100);

    return logs;
  } catch (error) {
    console.error('Get email logs error:', error);
    return [];
  }
};
