const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    plan: {
      type: String,
      enum: ['basic', 'professional', 'enterprise'],
      default: 'basic'
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      required: true
    },
    autoRenew: {
      type: Boolean,
      default: true
    },
    features: [String],
    jobPostingsPerMonth: {
      type: Number,
      default: 5
    },
    jobPostingsUsed: {
      type: Number,
      default: 0
    },
    priorityListing: {
      type: Boolean,
      default: false
    },
    analyticsAccess: {
      type: Boolean,
      default: false
    },
    paymentHistory: [{
      paymentId: mongoose.Schema.Types.ObjectId,
      amount: Number,
      paidAt: Date,
      status: String
    }],
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ endDate: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
