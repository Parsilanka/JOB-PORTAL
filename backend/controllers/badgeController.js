const User = require('../models/User');
const Application = require('../models/Application');
const Job = require('../models/Job');

const BADGES = [
  { key: 'starter', title: 'Starter', description: 'Joined the platform', threshold: 0 },
  { key: 'active', title: 'Active Contributor', description: 'Posted or applied to 3 opportunities', threshold: 3 },
  { key: 'trusted', title: 'Trusted Recruiter', description: 'Managed 5+ successful hires', threshold: 5 }
];

exports.getUserBadges = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const jobsCount = await Job.countDocuments({ employer: req.user._id });
    const applicationsCount = await Application.countDocuments({ applicant: req.user._id });
    const acceptedCount = await Application.countDocuments({ applicant: req.user._id, status: 'accepted' });

    const points = (applicationsCount * 10) + (acceptedCount * 50) + (jobsCount * 20);
    const earnedBadges = BADGES.filter((badge) => {
      if (badge.key === 'starter') return true;
      if (badge.key === 'active') return (applicationsCount + jobsCount) >= badge.threshold;
      if (badge.key === 'trusted') return acceptedCount >= badge.threshold;
      return false;
    }).map((badge) => ({ ...badge, earned: true }));

    res.status(200).json({
      success: true,
      data: {
        points,
        badges: earnedBadges,
        nextBadge: BADGES.find((badge) => !earnedBadges.some((earned) => earned.key === badge.key)) || null
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
