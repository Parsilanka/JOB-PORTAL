const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    jobSeeker: {
      totalApplications: {
        type: Number,
        default: 0
      },
      successfulApplications: {
        type: Number,
        default: 0
      },
      successRate: {
        type: Number,
        default: 0
      },
      jobsViewed: {
        type: Number,
        default: 0
      },
      profileViews: {
        type: Number,
        default: 0
      },
      averageResponseTime: {
        type: Number,
        default: 0
      },
      lastActivityDate: {
        type: Date,
        default: null
      }
    },
    employer: {
      totalJobsPosted: {
        type: Number,
        default: 0
      },
      totalApplicationsReceived: {
        type: Number,
        default: 0
      },
      totalHires: {
        type: Number,
        default: 0
      },
      averageHireTime: {
        type: Number,
        default: 0
      },
      profileViews: {
        type: Number,
        default: 0
      },
      averageRating: {
        type: Number,
        default: 0
      },
      totalReviews: {
        type: Number,
        default: 0
      }
    },
    monthlyData: [{
      month: {
        type: String,
        required: true
      },
      applications: Number,
      hires: Number,
      jobsPosted: Number,
      earnings: Number
    }],
    dashboardMetrics: {
      conversionRate: Number,
      engagementScore: Number,
      growthRate: Number
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('UserAnalytics', analyticsSchema);
