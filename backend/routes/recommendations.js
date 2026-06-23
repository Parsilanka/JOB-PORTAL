const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const recommendationController = require('../controllers/recommendationController');

// All routes require authentication
router.use(authenticate);

// Get recommendations
router.get('/', recommendationController.getRecommendations);

// Generate recommendations
router.post('/generate', recommendationController.generateRecommendations);

// Mark as viewed
router.patch('/:recommendationId/viewed', recommendationController.markAsViewed);

// Save recommendation
router.patch('/:recommendationId/save', recommendationController.saveRecommendation);

// Dismiss recommendation
router.patch('/:recommendationId/dismiss', recommendationController.dismissRecommendation);

module.exports = router;
