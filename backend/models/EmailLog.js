const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema(
  {
    recipient: {
      type: String,
      required: true,
      lowercase: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    subject: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: [
        'job_match',
        'application_confirmation',
        'application_update',
        'interview_scheduled',
        'password_reset',
        'welcome',
        'subscription_confirmation',
        'payment_receipt',
        'job_recommendation',
        'message_notification'
      ],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'bounced'],
      default: 'pending'
    },
    template: String,
    data: mongoose.Schema.Types.Mixed,
    error: String,
    sentAt: Date,
    failedAt: Date,
    retryCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

emailLogSchema.index({ recipient: 1, createdAt: -1 });
emailLogSchema.index({ status: 1 });
emailLogSchema.index({ type: 1 });

module.exports = mongoose.model('EmailLog', emailLogSchema);
