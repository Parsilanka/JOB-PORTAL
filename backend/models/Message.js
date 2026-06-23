const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    subject: {
      type: String,
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters']
    },
    content: {
      type: String,
      required: [true, 'Please provide message content'],
      maxlength: [5000, 'Message cannot exceed 5000 characters']
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date,
      default: null
    },
    attachments: [{
      filename: String,
      url: String,
      type: String
    }],
    conversationId: {
      type: String,
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
    }
  },
  {
    timestamps: true
  }
);

messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, isRead: 1 });
messageSchema.index({ conversationId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
