const Payment = require('../models/Payment');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const mpesaService = require('../services/mpesaService');

// @desc    Initiate M-Pesa payment for job application
// @route   POST /api/payments/initiate-application
// @access  Private
exports.initiateApplicationPayment = async (req, res, next) => {
  try {
    const { applicationId, phoneNumber } = req.body;

    if (!applicationId || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Application ID and phone number required'
      });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if already paid
    if (application.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'This application has already been paid for'
      });
    }

    const amount = process.env.APPLICATION_FEE || 50; // Default 50 KES

    // Create payment record
    const payment = await Payment.create({
      user: req.user._id,
      transactionType: 'job_application',
      amount,
      currency: 'KES',
      paymentMethod: 'mpesa',
      reference: 'application',
      referenceId: applicationId,
      phoneNumber,
      metadata: {
        applicationId
      }
    });

    // Initiate STK push
    const mpesaResponse = await mpesaService.initiateStkPush(
      phoneNumber,
      amount,
      applicationId,
      'Job Application Fee'
    );

    if (mpesaResponse.success) {
      payment.mpesaTransactionId = mpesaResponse.checkoutRequestId;
      await payment.save();

      res.status(200).json({
        success: true,
        message: 'Payment initiated. Please enter your M-Pesa PIN',
        data: {
          paymentId: payment._id,
          checkoutRequestId: mpesaResponse.checkoutRequestId,
          amount,
          phoneNumber
        }
      });
    } else {
      payment.status = 'failed';
      payment.errorMessage = mpesaResponse.error;
      await payment.save();

      res.status(400).json({
        success: false,
        message: mpesaResponse.error || 'Failed to initiate payment'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Initiate M-Pesa payment for job posting
// @route   POST /api/payments/initiate-job-posting
// @access  Private
exports.initiateJobPostingPayment = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number required'
      });
    }

    const amount = parseInt(process.env.JOB_POSTING_FEE) || 100; // Default 100 KES

    // Create payment record
    const payment = await Payment.create({
      user: req.user._id,
      transactionType: 'job_posting',
      amount,
      currency: 'KES',
      paymentMethod: 'mpesa',
      reference: 'job',
      phoneNumber,
      metadata: {
        employerId: req.user._id
      }
    });

    // Initiate STK push
    const mpesaResponse = await mpesaService.initiateStkPush(
      phoneNumber,
      amount,
      `JOB-${req.user._id}-${Date.now()}`,
      'Job Posting Fee'
    );

    if (mpesaResponse.success) {
      payment.mpesaTransactionId = mpesaResponse.checkoutRequestId;
      await payment.save();

      res.status(200).json({
        success: true,
        message: 'Payment initiated. Please enter your M-Pesa PIN',
        data: {
          paymentId: payment._id,
          checkoutRequestId: mpesaResponse.checkoutRequestId,
          amount,
          phoneNumber
        }
      });
    } else {
      payment.status = 'failed';
      payment.errorMessage = mpesaResponse.error;
      await payment.save();

      res.status(400).json({
        success: false,
        message: mpesaResponse.error || 'Failed to initiate payment'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Initiate M-Pesa payment for subscription
// @route   POST /api/payments/initiate-subscription
// @access  Private
exports.initiateSubscriptionPayment = async (req, res, next) => {
  try {
    const { plan, phoneNumber } = req.body;

    if (!plan || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Plan and phone number required'
      });
    }

    const planPrices = {
      basic: 499,
      professional: 999,
      enterprise: 2999
    };

    if (!planPrices[plan]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription plan'
      });
    }

    const amount = planPrices[plan];

    // Create payment record
    const payment = await Payment.create({
      user: req.user._id,
      transactionType: 'premium_subscription',
      amount,
      currency: 'KES',
      paymentMethod: 'mpesa',
      reference: 'subscription',
      phoneNumber,
      metadata: {
        subscriptionPlan: plan
      }
    });

    // Initiate STK push
    const mpesaResponse = await mpesaService.initiateStkPush(
      phoneNumber,
      amount,
      `SUB-${plan}-${req.user._id}`,
      `${plan} Subscription Plan`
    );

    if (mpesaResponse.success) {
      payment.mpesaTransactionId = mpesaResponse.checkoutRequestId;
      await payment.save();

      res.status(200).json({
        success: true,
        message: 'Payment initiated. Please enter your M-Pesa PIN',
        data: {
          paymentId: payment._id,
          checkoutRequestId: mpesaResponse.checkoutRequestId,
          amount,
          plan,
          phoneNumber
        }
      });
    } else {
      payment.status = 'failed';
      payment.errorMessage = mpesaResponse.error;
      await payment.save();

      res.status(400).json({
        success: false,
        message: mpesaResponse.error || 'Failed to initiate payment'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Handle M-Pesa webhook callback
// @route   POST /api/payments/mpesa-callback
// @access  Public
exports.handleMpesaCallback = async (req, res, next) => {
  try {
    // M-Pesa sends back ResultCode 0 for success
    const resultCode = req.body.Body?.stkCallback?.ResultCode;
    
    if (resultCode === 0) {
      // Payment successful
      const callbackData = mpesaService.parseCallback(req.body);
      
      if (callbackData.success) {
        // Find and update payment
        const payment = await Payment.findOne({
          mpesaTransactionId: callbackData.checkoutRequestId
        });

        if (payment) {
          payment.status = 'completed';
          payment.mpesaReceiptNumber = callbackData.transactionId;
          payment.completedAt = new Date();
          await payment.save();

          // Process based on transaction type
          if (payment.transactionType === 'job_application') {
            const application = await Application.findById(payment.metadata.applicationId);
            if (application) {
              application.paymentStatus = 'completed';
              application.paidAmount = payment.amount;
              application.paidAt = new Date();
              await application.save();
            }
          } else if (payment.transactionType === 'premium_subscription') {
            // Create or update subscription
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1);

            const subscription = await Subscription.findOneAndUpdate(
              { user: payment.user },
              {
                plan: payment.metadata.subscriptionPlan,
                status: 'active',
                startDate: new Date(),
                endDate,
                $push: {
                  paymentHistory: {
                    paymentId: payment._id,
                    amount: payment.amount,
                    paidAt: new Date(),
                    status: 'completed'
                  }
                }
              },
              { upsert: true, new: true }
            );
          }
        }
      }
    } else {
      // Payment failed
      const checkoutRequestId = req.body.Body?.stkCallback?.CheckoutRequestID;
      if (checkoutRequestId) {
        await Payment.findOneAndUpdate(
          { mpesaTransactionId: checkoutRequestId },
          { status: 'failed' }
        );
      }
    }

    // Acknowledge receipt of callback
    res.status(200).json({
      success: true,
      message: 'Callback received'
    });
  } catch (error) {
    console.error('Callback error:', error);
    res.status(200).json({
      success: true,
      message: 'Callback received'
    });
  }
};

// @desc    Complete a test payment (for development/testing only)
// @route   POST /api/payments/:paymentId/complete-test
// @access  Private
exports.completeTestPayment = async (req, res, next) => {
  try {
    // Only allow in test mode
    if (process.env.MPESA_TEST_MODE !== 'true') {
      return res.status(403).json({
        success: false,
        message: 'This endpoint is only available in test mode'
      });
    }

    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if user owns this payment
    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete this payment'
      });
    }

    // Mark payment as completed
    payment.status = 'completed';
    payment.mpesaReceiptNumber = 'TEST_' + Date.now();
    payment.completedAt = new Date();
    await payment.save();

    // Process based on transaction type
    if (payment.transactionType === 'job_application') {
      const application = await Application.findById(payment.metadata.applicationId);
      if (application) {
        application.paymentStatus = 'completed';
        application.paidAmount = payment.amount;
        application.paidAt = new Date();
        await application.save();
      }
    } else if (payment.transactionType === 'job_posting') {
      // Job posting payment completed
      // Job will be created by frontend
    } else if (payment.transactionType === 'premium_subscription') {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      await Subscription.findOneAndUpdate(
        { user: payment.user },
        {
          plan: payment.metadata.subscriptionPlan,
          status: 'active',
          startDate: new Date(),
          endDate,
          $push: {
            paymentHistory: {
              paymentId: payment._id,
              amount: payment.amount,
              paidAt: new Date(),
              status: 'completed'
            }
          }
        },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Test payment completed successfully',
      data: {
        paymentId: payment._id,
        status: payment.status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get payment status
// @route   GET /api/payments/:paymentId/status
// @access  Private
exports.getPaymentStatus = async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if user owns this payment
    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this payment'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        paymentId: payment._id,
        status: payment.status,
        amount: payment.amount,
        transactionType: payment.transactionType,
        completedAt: payment.completedAt,
        mpesaReceiptNumber: payment.mpesaReceiptNumber,
        errorMessage: payment.errorMessage
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
exports.getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all payments (Admin)
// @route   GET /api/payments/admin/all
// @access  Private (Admin)
exports.getAllPayments = async (req, res, next) => {
  try {
    const { status, transactionType, page = 1, limit = 20 } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (transactionType) filter.transactionType = transactionType;

    const startIndex = (Number(page) - 1) * Number(limit);
    const total = await Payment.countDocuments(filter);
    
    const payments = await Payment.find(filter)
      .populate('user', 'fullName email phone')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      pages: Math.ceil(total / limit),
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get payment statistics (Admin)
// @route   GET /api/payments/admin/stats
// @access  Private (Admin)
exports.getPaymentStats = async (req, res, next) => {
  try {
    const stats = await Payment.aggregate([
      {
        $match: { status: 'completed' }
      },
      {
        $group: {
          _id: '$transactionType',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      }
    ]);

    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const dailyRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        byType: stats,
        totalRevenue: totalRevenue[0]?.total || 0,
        dailyRevenue
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
