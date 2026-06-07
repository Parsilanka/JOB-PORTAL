const express = require('express');
const {
  getMySubscription,
  checkPremiumAccess,
  getAllSubscriptions,
  getSubscriptionStats,
  expireSubscriptions,
  cancelSubscription,
  getPlans
} = require('../controllers/subscriptionController');
const { protect, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/plans', getPlans);

// User routes
router.get('/my', protect, getMySubscription);
router.get('/check-premium', protect, checkPremiumAccess);

// Admin routes
router.get('/admin/all', protect, isAdmin, getAllSubscriptions);
router.get('/admin/stats', protect, isAdmin, getSubscriptionStats);
router.post('/admin/expire-check', protect, isAdmin, expireSubscriptions);
router.put('/admin/:id/cancel', protect, isAdmin, cancelSubscription);

module.exports = router;
