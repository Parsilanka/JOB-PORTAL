const express = require('express');
const {
  initiateApplicationPayment,
  initiateSubscriptionPayment,
  handleMpesaCallback,
  getPaymentHistory,
  getAllPayments,
  getPaymentStats
} = require('../controllers/paymentController');
const { protect, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Payment initiation
router.post('/initiate-application', protect, initiateApplicationPayment);
router.post('/initiate-subscription', protect, initiateSubscriptionPayment);

// M-Pesa callback (public - from Safaricom servers)
router.post('/mpesa-callback', handleMpesaCallback);

// User payment history
router.get('/history', protect, getPaymentHistory);

// Admin routes
router.get('/admin/all', protect, isAdmin, getAllPayments);
router.get('/admin/stats', protect, isAdmin, getPaymentStats);

module.exports = router;
