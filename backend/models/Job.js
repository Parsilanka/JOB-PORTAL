const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide job title'],
      trim: true,
      maxlength: [100, 'Job title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide job description']
    },
    location: {
      type: String,
      required: [true, 'Please provide job location'],
      trim: true
    },
    salary: {
      min: {
        type: Number,
        default: 0
      },
      max: {
        type: Number,
        default: 0
      },
      currency: {
        type: String,
        default: 'Ksh'
      }
    },
    jobType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship'],
      required: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    requirements: [{
      type: String,
      trim: true
    }],
    skills: [{
      type: String,
      trim: true
    }],
    experienceLevel: {
      type: String,
      enum: ['Entry', 'Mid', 'Senior'],
      default: 'Mid'
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    applicants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application'
    }],
    status: {
      type: String,
      enum: ['active', 'inactive', 'filled', 'closed'],
      default: 'active'
    },
    viewCount: {
      type: Number,
      default: 0
    },
    applicationCount: {
      type: Number,
      default: 0
    },
    deadline: {
      type: Date,
      required: [true, 'Please provide application deadline']
    },
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

// Index for faster search
jobSchema.index({ title: 'text', description: 'text', location: 'text' });
jobSchema.index({ employer: 1, createdAt: -1 });
jobSchema.index({ status: 1 });
jobSchema.index({ category: 1 });

module.exports = mongoose.model('Job', jobSchema);
