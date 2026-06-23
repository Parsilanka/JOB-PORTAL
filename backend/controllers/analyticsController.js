const UserAnalytics = require('../models/UserAnalytics');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Review = require('../models/Review');

// Get analytics for a user
exports.getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    let analytics = await UserAnalytics.findOne({ user: userId });
    
    if (!analytics) {
      analytics = new UserAnalytics({ user: userId });
      await analytics.save();
    }

    // Update analytics based on user type
    if (user.accountType === 'job_seeker') {
      await updateJobSeekerAnalytics(userId, analytics);
    } else if (user.accountType === 'employer') {
      await updateEmployerAnalytics(userId, analytics);
    }

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get dashboard metrics
exports.getDashboardMetrics = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    let analytics = await UserAnalytics.findOne({ user: userId });
    
    if (!analytics) {
      analytics = new UserAnalytics({ user: userId });
      await analytics.save();
    }

    const metrics = {
      user: {
        name: user.fullName,
        accountType: user.accountType,
        joinDate: user.createdAt
      },
      stats: {}
    };

    if (user.accountType === 'job_seeker') {
      const applications = await Application.countDocuments({ applicant: userId });
      const successfulApplications = await Application.countDocuments({
        applicant: userId,
        status: 'hired'
      });

      metrics.stats = {
        totalApplications: applications,
        successfulApplications,
        successRate: applications > 0 ? ((successfulApplications / applications) * 100).toFixed(1) : 0,
        profileViews: analytics.jobSeeker.profileViews,
        averageResponseTime: analytics.jobSeeker.averageResponseTime
      };
    } else if (user.accountType === 'employer') {
      const jobs = await Job.countDocuments({ postedBy: userId });
      const applicationsReceived = await Application.countDocuments({ job: { $in: await Job.find({ postedBy: userId }).select('_id') } });
      const reviews = await Review.countDocuments({ targetUser: userId });

      metrics.stats = {
        totalJobsPosted: jobs,
        totalApplicationsReceived: applicationsReceived,
        totalReviews: reviews,
        averageRating: analytics.employer.averageRating,
        profileViews: analytics.employer.profileViews
      };
    }

    res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get monthly analytics
exports.getMonthlyAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { months = 12 } = req.query;

    let analytics = await UserAnalytics.findOne({ user: userId });
    
    if (!analytics) {
      analytics = new UserAnalytics({ user: userId });
      await analytics.save();
    }

    // Generate monthly data for the last N months
    const monthlyData = generateMonthlyData(parseInt(months));

    // In a real application, you'd fetch this from the database
    // For now, we'll return empty data that should be populated
    const populatedData = monthlyData.map((month, index) => {
      const existingMonth = analytics.monthlyData?.find(m => m.month === month);
      return existingMonth || {
        month,
        applications: 0,
        hires: 0,
        jobsPosted: 0,
        earnings: 0
      };
    });

    res.status(200).json({
      success: true,
      data: populatedData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get performance comparison
exports.getPerformanceComparison = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    let analytics = await UserAnalytics.findOne({ user: userId });
    
    if (!analytics) {
      analytics = new UserAnalytics({ user: userId });
      await analytics.save();
    }

    const comparison = {
      userStats: {},
      benchmarkStats: {},
      performance: {}
    };

    if (user.accountType === 'job_seeker') {
      comparison.userStats = {
        successRate: analytics.jobSeeker.successRate,
        avgResponseTime: analytics.jobSeeker.averageResponseTime,
        profileViews: analytics.jobSeeker.profileViews
      };

      // Calculate benchmarks (mock data)
      comparison.benchmarkStats = {
        successRate: 15,
        avgResponseTime: 2,
        profileViews: 25
      };

      comparison.performance = {
        successRateVsBenchmark: ((analytics.jobSeeker.successRate / comparison.benchmarkStats.successRate) * 100).toFixed(1),
        responseTimeVsBenchmark: ((comparison.benchmarkStats.avgResponseTime / analytics.jobSeeker.averageResponseTime) * 100).toFixed(1)
      };
    } else if (user.accountType === 'employer') {
      comparison.userStats = {
        averageRating: analytics.employer.averageRating,
        totalHires: analytics.employer.totalHires,
        totalReviews: analytics.employer.totalReviews
      };

      comparison.benchmarkStats = {
        averageRating: 4.2,
        totalHires: 5,
        totalReviews: 10
      };

      comparison.performance = {
        ratingVsBenchmark: ((analytics.employer.averageRating / comparison.benchmarkStats.averageRating) * 100).toFixed(1),
        hiresVsBenchmark: ((analytics.employer.totalHires / comparison.benchmarkStats.totalHires) * 100).toFixed(1)
      };
    }

    res.status(200).json({
      success: true,
      data: comparison
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper functions
async function updateJobSeekerAnalytics(userId, analytics) {
  const applications = await Application.find({ applicant: userId });
  const successfulApplications = applications.filter(a => a.status === 'hired');

  analytics.jobSeeker.totalApplications = applications.length;
  analytics.jobSeeker.successfulApplications = successfulApplications.length;
  analytics.jobSeeker.successRate = applications.length > 0
    ? parseFloat(((successfulApplications.length / applications.length) * 100).toFixed(1))
    : 0;
  analytics.jobSeeker.lastActivityDate = new Date();

  await analytics.save();
}

async function updateEmployerAnalytics(userId, analytics) {
  const jobs = await Job.find({ postedBy: userId });
  const totalApplications = await Application.countDocuments({
    job: { $in: jobs.map(j => j._id) }
  });
  const hiredApplications = await Application.countDocuments({
    job: { $in: jobs.map(j => j._id) },
    status: 'hired'
  });

  const reviews = await Review.find({ targetUser: userId, reviewType: 'employer' });
  const averageRating = reviews.length > 0
    ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
    : 0;

  analytics.employer.totalJobsPosted = jobs.length;
  analytics.employer.totalApplicationsReceived = totalApplications;
  analytics.employer.totalHires = hiredApplications;
  analytics.employer.averageRating = averageRating;
  analytics.employer.totalReviews = reviews.length;

  await analytics.save();
}

function generateMonthlyData(months) {
  const data = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    data.push(monthStr);
  }

  return data;
}
