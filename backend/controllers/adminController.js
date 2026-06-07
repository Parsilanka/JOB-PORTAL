const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalJobSeekers = await User.countDocuments({ accountType: 'job_seeker' });
    const totalEmployers = await User.countDocuments({ accountType: 'employer' });
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const totalApplications = await Application.countDocuments();

    const applicationStats = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalJobSeekers,
        totalEmployers,
        totalJobs,
        activeJobs,
        totalApplications,
        applicationStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { accountType, page = 1, limit = 10 } = req.query;

    let filter = {};
    if (accountType) {
      filter.accountType = accountType;
    }

    const startIndex = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .skip(startIndex)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pages: Math.ceil(total / limit),
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Approve/Reject user
// @route   PUT /api/admin/users/:id/approve
// @access  Private (Admin only)
exports.approveUser = async (req, res, next) => {
  try {
    const { isApproved } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `User ${isApproved ? 'approved' : 'rejected'} successfully`,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all jobs (admin view)
// @route   GET /api/admin/jobs
// @access  Private (Admin only)
exports.getAllJobs = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let filter = {};
    if (status) {
      filter.status = status;
    }

    const startIndex = (Number(page) - 1) * Number(limit);
    const total = await Job.countDocuments(filter);
    const jobs = await Job.find(filter)
      .populate('employer', 'fullName companyName')
      .skip(startIndex)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      pages: Math.ceil(total / limit),
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update job status
// @route   PUT /api/admin/jobs/:id
// @access  Private (Admin only)
exports.updateJobStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Job status updated successfully',
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get pending jobs for approval
// @route   GET /api/admin/jobs/pending
// @access  Private (Admin only)
exports.getPendingJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const startIndex = (Number(page) - 1) * Number(limit);
    const total = await Job.countDocuments({ adminApproved: false });

    const jobs = await Job.find({ adminApproved: false })
      .populate('employer', 'fullName companyName email')
      .skip(startIndex)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      pages: Math.ceil(total / limit),
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Approve or reject job posting
// @route   PUT /api/admin/jobs/:id/approve
// @access  Private (Admin only)
exports.approveJob = async (req, res, next) => {
  try {
    const { adminApproved, approvalNotes } = req.body;

    if (typeof adminApproved !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Please specify approval status'
      });
    }

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      {
        adminApproved,
        approvedBy: req.user._id,
        approvalNotes: approvalNotes || ''
      },
      { new: true }
    ).populate('employer', 'fullName email');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Job ${adminApproved ? 'approved' : 'rejected'} successfully`,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Control feature access for users
// @route   PUT /api/admin/users/:id/features
// @access  Private (Admin only)
exports.controlUserFeatures = async (req, res, next) => {
  try {
    const { canPostJobs, canApplyJobs, features } = req.body;

    const updateData = {};
    if (canPostJobs !== undefined) updateData.canPostJobs = canPostJobs;
    if (canApplyJobs !== undefined) updateData.canApplyJobs = canApplyJobs;
    if (features) updateData.allowedFeatures = features;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User features updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get financial dashboard
// @route   GET /api/admin/finances
// @access  Private (Admin only)
exports.getFinancialDashboard = async (req, res, next) => {
  try {
    const Payment = require('../models/Payment');
    const Subscription = require('../models/Subscription');

    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const revenueByType = await Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$transactionType',
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const subscriptionStats = await Subscription.aggregate([
      {
        $group: {
          _id: '$plan',
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [{ $eq: ['$status', 'active'] }, 999, 0]
            }
          }
        }
      }
    ]);

    const pendingPayments = await Payment.countDocuments({ status: 'pending' });
    const failedPayments = await Payment.countDocuments({ status: 'failed' });

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: totalRevenue[0]?.total || 0,
        revenueByType,
        subscriptionStats,
        pendingPayments,
        failedPayments
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
