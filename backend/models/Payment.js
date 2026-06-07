const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    transactionType: {
      type: String,
      enum: ['job_application', 'job_posting', 'premium_subscription'],
      required: true
    },
    amount: {
      type: Number,
      required: [true, 'Please provide amount'],
      min: 0
    },
    currency: {
      type: String,
      default: 'KES'
    },
    paymentMethod: {
      type: String,
      enum: ['mpesa', 'card', 'bank_transfer'],
      default: 'mpesa'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending'
    },
    mpesaTransactionId: {
      type: String,
      unique: true,
      sparse: true
    },
    mpesaReceiptNumber: String,
    phoneNumber: String,
    reference: {
      type: String,
      enum: ['application', 'job', 'subscription'],
      required: true
    },
    referenceId: mongoose.Schema.Types.ObjectId,
    metadata: {
      jobId: mongoose.Schema.Types.ObjectId,
      applicationId: mongoose.Schema.Types.ObjectId,
      subscriptionPlan: String
    },
    errorMessage: String,
    completedAt: Date,
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

paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ mpesaTransactionId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
