const Subscription = require('../models/Subscription');
const User = require('../models/User');

// @desc    Get current user subscription
// @route   GET /api/subscriptions/my
// @access  Private
exports.getMySubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription'
      });
    }

    // Check if subscription has expired
    if (new Date(subscription.endDate) < new Date()) {
      subscription.status = 'expired';
      await subscription.save();
    }

    res.status(200).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Check if user has premium access
// @route   GET /api/subscriptions/check-premium
// @access  Private
exports.checkPremiumAccess = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: 'active',
      endDate: { $gte: new Date() }
    });

    const hasPremium = !!subscription;

    res.status(200).json({
      success: true,
      hasPremium,
      plan: subscription?.plan || null,
      subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all subscriptions (Admin)
// @route   GET /api/subscriptions/admin/all
// @access  Private (Admin)
exports.getAllSubscriptions = async (req, res, next) => {
  try {
    const { status, plan, page = 1, limit = 20 } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (plan) filter.plan = plan;

    const startIndex = (Number(page) - 1) * Number(limit);
    const total = await Subscription.countDocuments(filter);

    const subscriptions = await Subscription.find(filter)
      .populate('user', 'fullName email phone accountType')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: subscriptions.length,
      total,
      pages: Math.ceil(total / limit),
      data: subscriptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get subscription statistics (Admin)
// @route   GET /api/subscriptions/admin/stats
// @access  Private (Admin)
exports.getSubscriptionStats = async (req, res, next) => {
  try {
    const stats = await Subscription.aggregate([
      {
        $group: {
          _id: '$plan',
          count: { $sum: 1 },
          activeCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$status', 'active'] },
                    { $gte: ['$endDate', new Date()] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const totalSubscribers = await Subscription.countDocuments({
      status: 'active',
      endDate: { $gte: new Date() }
    });

    const activeCount = await Subscription.countDocuments({
      status: 'active'
    });

    res.status(200).json({
      success: true,
      data: {
        byPlan: stats,
        totalSubscribers,
        activeSubscriptions: activeCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Expire subscriptions (Admin - cron job)
// @route   POST /api/subscriptions/admin/expire-check
// @access  Private (Admin)
exports.expireSubscriptions = async (req, res, next) => {
  try {
    const result = await Subscription.updateMany(
      {
        status: 'active',
        endDate: { $lt: new Date() }
      },
      {
        status: 'expired',
        updatedAt: new Date()
      }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} subscriptions expired`,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel subscription (Admin)
// @route   PUT /api/subscriptions/admin/:id/cancel
// @access  Private (Admin)
exports.cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      {
        status: 'cancelled',
        endDate: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subscription cancelled',
      data: subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get subscription plans
// @route   GET /api/subscriptions/plans
// @access  Public
exports.getPlans = async (req, res, next) => {
  try {
    const plans = [
      {
        name: 'Basic',
        slug: 'basic',
        price: 499,
        period: 'Monthly',
        features: [
          '5 Job Postings/Month',
          'Application Management',
          'Basic Analytics',
          'Email Support'
        ]
      },
      {
        name: 'Professional',
        slug: 'professional',
        price: 999,
        period: 'Monthly',
        features: [
          'Unlimited Job Postings',
          'Advanced Analytics',
          'Priority Support',
          'Featured Listings',
          'Candidate Screening Tools'
        ]
      },
      {
        name: 'Enterprise',
        slug: 'enterprise',
        price: 2999,
        period: 'Monthly',
        features: [
          'Everything in Professional',
          'Dedicated Account Manager',
          'Custom Integrations',
          'API Access',
          '24/7 Premium Support',
          'White Label Options'
        ]
      }
    ];

    res.status(200).json({
      success: true,
      data: plans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
