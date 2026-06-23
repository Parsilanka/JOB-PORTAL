const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: [
        'job_match',
        'application_update',
        'message',
        'interview_scheduled',
        'job_posted',
        'payment_received',
        'subscription_expiring',
        'new_review',
        'job_recommendation'
      ],
      required: true
    },
    title: {
      type: String,
      required: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    icon: {
      type: String,
      default: 'bell'
    },
    data: {
      relatedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
      },
      relatedJob: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        default: null
      },
      relatedApplication: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
        default: null
      },
      relatedMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        default: null
      },
      customData: mongoose.Schema.Types.Mixed
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date,
      default: null
    },
    actionUrl: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ user: 1, type: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
