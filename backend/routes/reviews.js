const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const reviewController = require('../controllers/reviewController');

// All routes require authentication
router.use(authenticate);

// Create a review
router.post('/', reviewController.createReview);

// Get reviews for a user
router.get('/user/:userId', reviewController.getUserReviews);

// Update a review
router.patch('/:reviewId', reviewController.updateReview);

// Delete a review
router.delete('/:reviewId', reviewController.deleteReview);

// Mark review as helpful
router.post('/:reviewId/helpful', reviewController.markReviewHelpful);

// Reply to a review
router.post('/:reviewId/reply', reviewController.replyToReview);

module.exports = router;
