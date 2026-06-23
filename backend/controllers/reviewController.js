const Review = require('../models/Review');
const User = require('../models/User');
const Notification = require('../models/Notification');
const UserAnalytics = require('../models/UserAnalytics');

// Create a review
exports.createReview = async (req, res) => {
  try {
    const { targetUserId, reviewType, rating, title, content, categories, relatedJob, relatedApplication } = req.body;
    const authorId = req.user.id;

    // Validation
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    if (authorId === targetUserId) {
      return res.status(400).json({ message: 'You cannot review yourself' });
    }

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check for existing review
    const existingReview = await Review.findOne({
      author: authorId,
      targetUser: targetUserId,
      relatedApplication
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this user for this interaction' });
    }

    const review = new Review({
      author: authorId,
      targetUser: targetUserId,
      reviewType,
      rating,
      title,
      content,
      categories: categories || {},
      relatedJob: relatedJob || null,
      relatedApplication: relatedApplication || null
    });

    await review.save();
    await review.populate('author');

    // Update user analytics
    await updateUserRating(targetUserId);

    // Create notification
    await Notification.create({
      user: targetUserId,
      type: 'new_review',
      title: `You received a new ${rating}-star review`,
      description: title,
      data: {
        relatedUser: authorId
      },
      actionUrl: `/profile/${targetUserId}/reviews`
    });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get reviews for a user
exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reviewType, limit = 10, offset = 0 } = req.query;

    const query = { targetUser: userId };
    if (reviewType) {
      query.reviewType = reviewType;
    }

    const reviews = await Review.find(query)
      .populate('author', 'fullName profilePicture')
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const total = await Review.countDocuments(query);

    // Calculate average rating and breakdown
    const allReviews = await Review.find(query);
    const averageRating = allReviews.length > 0
      ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
      : 0;

    const ratingBreakdown = {
      5: allReviews.filter(r => r.rating === 5).length,
      4: allReviews.filter(r => r.rating === 4).length,
      3: allReviews.filter(r => r.rating === 3).length,
      2: allReviews.filter(r => r.rating === 2).length,
      1: allReviews.filter(r => r.rating === 1).length
    };

    res.status(200).json({
      success: true,
      data: reviews,
      stats: {
        totalReviews: total,
        averageRating,
        ratingBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, content, categories } = req.body;
    const userId = req.user.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (!review.author.equals(userId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (rating) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      review.rating = rating;
    }

    if (title) review.title = title;
    if (content) review.content = content;
    if (categories) review.categories = categories;

    await review.save();
    await review.populate('author');

    // Update user analytics
    await updateUserRating(review.targetUser);

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: review
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (!review.author.equals(userId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const targetUserId = review.targetUser;
    await Review.findByIdAndDelete(reviewId);

    // Update user analytics
    await updateUserRating(targetUserId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark review as helpful
exports.markReviewHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { helpful } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (helpful) {
      review.helpfulCount += 1;
    } else {
      review.unhelpfulCount += 1;
    }

    await review.save();

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reply to a review
exports.replyToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (!review.targetUser.equals(userId)) {
      return res.status(403).json({ message: 'Only the reviewed user can reply' });
    }

    review.responses.push({
      author: userId,
      content,
      createdAt: new Date()
    });

    await review.save();
    await review.populate('author');

    res.status(200).json({
      success: true,
      message: 'Reply added successfully',
      data: review
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to update user rating
async function updateUserRating(userId) {
  try {
    const reviews = await Review.find({ targetUser: userId });
    if (reviews.length === 0) return;

    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    let analytics = await UserAnalytics.findOne({ user: userId });
    if (!analytics) {
      analytics = new UserAnalytics({ user: userId });
    }

    if (analytics.employer) {
      analytics.employer.averageRating = parseFloat(averageRating.toFixed(1));
      analytics.employer.totalReviews = reviews.length;
      await analytics.save();
    }
  } catch (error) {
    console.error('Error updating user rating:', error);
  }
}
