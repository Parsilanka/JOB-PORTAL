const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema(
  {
    jobSeeker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    matchScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    matchReason: {
      skillMatch: Number,
      experienceMatch: Number,
      locationMatch: Number,
      salaryExpectationMatch: Number
    },
    isViewed: {
      type: Boolean,
      default: false
    },
    viewedAt: {
      type: Date,
      default: null
    },
    isApplied: {
      type: Boolean,
      default: false
    },
    isSaved: {
      type: Boolean,
      default: false
    },
    isDismissed: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

recommendationSchema.index({ jobSeeker: 1, matchScore: -1 });
recommendationSchema.index({ jobSeeker: 1, isViewed: 1 });
recommendationSchema.index({ job: 1 });

module.exports = mongoose.model('JobRecommendation', recommendationSchema);
