const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    fullName: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Please provide your phone number'],
      trim: true
    },
    currentPosition: {
      type: String,
      trim: true,
      default: ''
    },
    experience: {
      type: String,
      required: [true, 'Please provide your experience'],
      trim: true
    },
    resume: {
      type: String,
      required: [true, 'Please upload a resume']
    },
    coverLetter: {
      type: String,
      default: ''
    },
    interviewDate: Date,
    interviewTime: {
      type: String,
      trim: true,
      default: ''
    },
    interviewMode: {
      type: String,
      trim: true,
      default: ''
    },
    interviewLink: {
      type: String,
      trim: true,
      default: ''
    },
    interviewNotes: {
      type: String,
      trim: true,
      default: ''
    },
    interviewScheduledAt: Date,
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'],
      default: 'pending'
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: null
    },
    comments: {
      type: String,
      default: ''
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    reviewedAt: Date,
    rejectedAt: Date,
    acceptedAt: Date,
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

// Prevent duplicate applications
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ applicant: 1, status: 1 });
applicationSchema.index({ job: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
