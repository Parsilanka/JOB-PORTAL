const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

// All routes require authentication
router.use(authenticate);

// Get analytics
router.get('/', analyticsController.getAnalytics);

// Get dashboard metrics
router.get('/dashboard/metrics', analyticsController.getDashboardMetrics);

// Get monthly analytics
router.get('/monthly/data', analyticsController.getMonthlyAnalytics);

// Get performance comparison
router.get('/performance/comparison', analyticsController.getPerformanceComparison);

module.exports = router;
