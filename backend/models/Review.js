const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
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
    reviewType: {
      type: String,
      enum: ['employer', 'employee', 'freelancer'],
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be an integer'
      }
    },
    title: {
      type: String,
      required: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      trim: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [2000, 'Review cannot exceed 2000 characters']
    },
    categories: {
      communication: {
        type: Number,
        min: 1,
        max: 5
      },
      professionalism: {
        type: Number,
        min: 1,
        max: 5
      },
      timeliness: {
        type: Number,
        min: 1,
        max: 5
      },
      quality: {
        type: Number,
        min: 1,
        max: 5
      }
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    helpfulCount: {
      type: Number,
      default: 0
    },
    unhelpfulCount: {
      type: Number,
      default: 0
    },
    responses: [{
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      content: String,
      createdAt: Date
    }]
  },
  {
    timestamps: true
  }
);

reviewSchema.index({ targetUser: 1, rating: 1 });
reviewSchema.index({ author: 1, createdAt: -1 });
reviewSchema.index({ reviewType: 1, rating: 1 });

module.exports = mongoose.model('Review', reviewSchema);
