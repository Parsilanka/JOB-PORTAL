const JobRecommendation = require('../models/JobRecommendation');
const Job = require('../models/Job');
const User = require('../models/User');
const Application = require('../models/Application');
const Notification = require('../models/Notification');

// Get job recommendations for a user
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, offset = 0 } = req.query;

    const recommendations = await JobRecommendation.find({ jobSeeker: userId })
      .populate('job')
      .sort({ matchScore: -1, createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const total = await JobRecommendation.countDocuments({ jobSeeker: userId });

    res.status(200).json({
      success: true,
      data: recommendations,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate recommendations for a user (should be called periodically or on demand)
exports.generateRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user || user.accountType !== 'job_seeker') {
      return res.status(400).json({ message: 'Invalid user type' });
    }

    // Get user's skills and preferences
    const userSkills = user.skills || [];
    const userLocation = user.location;
    const salaryExpectation = user.salaryExpectation || {};

    // Find jobs that match user profile
    const matchingJobs = await Job.find({
      status: 'active',
      location: { $regex: userLocation, $options: 'i' }
    });

    // Clear existing recommendations for this user
    await JobRecommendation.deleteMany({ jobSeeker: userId });

    // Generate new recommendations
    const recommendations = [];
    for (const job of matchingJobs) {
      const matchScore = calculateMatchScore(user, job);

      if (matchScore > 30) {
        // Only create recommendations with match score > 30
        const recommendation = new JobRecommendation({
          jobSeeker: userId,
          job: job._id,
          matchScore,
          matchReason: {
            skillMatch: calculateSkillMatch(userSkills, job.skills || []),
            experienceMatch: calculateExperienceMatch(user.experience || 0, job.experience || 0),
            locationMatch: 100, // Already filtered by location
            salaryExpectationMatch: calculateSalaryMatch(salaryExpectation, job.salary)
          }
        });
        recommendations.push(recommendation);
      }
    }

    await JobRecommendation.insertMany(recommendations);

    // Create notification
    await Notification.create({
      user: userId,
      type: 'job_recommendation',
      title: `We found ${recommendations.length} jobs matching your profile`,
      description: 'Check out our latest recommendations',
      actionUrl: '/recommendations'
    });

    res.status(200).json({
      success: true,
      message: `Generated ${recommendations.length} recommendations`,
      data: recommendations.slice(0, 10)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark job as viewed
exports.markAsViewed = async (req, res) => {
  try {
    const { recommendationId } = req.params;
    const userId = req.user.id;

    const recommendation = await JobRecommendation.findById(recommendationId);
    if (!recommendation) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }

    if (!recommendation.jobSeeker.equals(userId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    recommendation.isViewed = true;
    recommendation.viewedAt = new Date();
    await recommendation.save();

    res.status(200).json({
      success: true,
      data: recommendation
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Save job recommendation
exports.saveRecommendation = async (req, res) => {
  try {
    const { recommendationId } = req.params;
    const userId = req.user.id;

    const recommendation = await JobRecommendation.findById(recommendationId);
    if (!recommendation) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }

    if (!recommendation.jobSeeker.equals(userId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    recommendation.isSaved = !recommendation.isSaved;
    await recommendation.save();

    res.status(200).json({
      success: true,
      message: recommendation.isSaved ? 'Job saved' : 'Job unsaved',
      data: recommendation
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Dismiss recommendation
exports.dismissRecommendation = async (req, res) => {
  try {
    const { recommendationId } = req.params;
    const userId = req.user.id;

    const recommendation = await JobRecommendation.findById(recommendationId);
    if (!recommendation) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }

    if (!recommendation.jobSeeker.equals(userId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    recommendation.isDismissed = true;
    await recommendation.save();

    res.status(200).json({
      success: true,
      message: 'Recommendation dismissed',
      data: recommendation
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper functions
function calculateMatchScore(user, job) {
  let score = 0;
  
  const skillMatch = calculateSkillMatch(user.skills || [], job.skills || []);
  const experienceMatch = calculateExperienceMatch(user.experience || 0, job.experience || 0);
  const salaryMatch = calculateSalaryMatch(user.salaryExpectation || {}, job.salary);

  score = (skillMatch * 0.4) + (experienceMatch * 0.3) + (salaryMatch * 0.3);
  
  return Math.round(score);
}

function calculateSkillMatch(userSkills, jobSkills) {
  if (jobSkills.length === 0) return 50;
  
  const matchedSkills = userSkills.filter(skill =>
    jobSkills.some(jSkill => jSkill.toLowerCase().includes(skill.toLowerCase()))
  ).length;

  return (matchedSkills / jobSkills.length) * 100;
}

function calculateExperienceMatch(userExp, jobExp) {
  if (userExp >= jobExp) {
    return 100;
  }
  return (userExp / jobExp) * 100;
}

function calculateSalaryMatch(userSalary, jobSalary) {
  const userMin = userSalary.min || 0;
  const jobMin = jobSalary.min || 0;
  const jobMax = jobSalary.max || Infinity;

  if (userMin >= jobMin && userMin <= jobMax) {
    return 100;
  }

  if (userMin > jobMax) {
    return Math.max(0, 100 - ((userMin - jobMax) / jobMax) * 10);
  }

  return Math.max(0, 100 - ((jobMin - userMin) / userMin) * 10);
}
