const JobRecommendation = require('../models/JobRecommendation');
const Job = require('../models/Job');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, offset = 0 } = req.query;

    const recommendations = await JobRecommendation.find({ jobSeeker: userId, isDismissed: false })
      .populate('job', 'title location salary category skills jobType employer')
      .sort({ matchScore: -1, createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const total = await JobRecommendation.countDocuments({ jobSeeker: userId, isDismissed: false });

    res.status(200).json({
      success: true,
      data: recommendations,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.generateRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user || user.accountType !== 'job_seeker') {
      return res.status(400).json({ message: 'Invalid user type' });
    }

    const userSkills = (user.skills || []).map((skill) => skill.toLowerCase());
    const userLocation = (user.location || '').toLowerCase();
    const userExperience = Array.isArray(user.experience) ? user.experience.length : Number(user.experience) || 0;
    const salaryExpectation = user.salaryExpectation || {};

    const baseQuery = { status: 'active' };
    if (userLocation) {
      baseQuery.location = { $regex: userLocation, $options: 'i' };
    }

    const matchingJobs = await Job.find(baseQuery)
      .populate('employer', 'fullName companyName')
      .sort({ createdAt: -1 });

    await JobRecommendation.deleteMany({ jobSeeker: userId });

    const recommendations = [];
    for (const job of matchingJobs) {
      const matchScore = calculateMatchScore(userSkills, userExperience, salaryExpectation, job);
      if (matchScore < 35) continue;

      recommendations.push({
        jobSeeker: userId,
        job: job._id,
        matchScore,
        matchReason: {
          skillMatch: calculateSkillMatch(userSkills, (job.skills || []).map((skill) => skill.toLowerCase())),
          experienceMatch: calculateExperienceMatch(userExperience, job.experienceLevel),
          locationMatch: calculateLocationMatch(userLocation, (job.location || '').toLowerCase()),
          salaryExpectationMatch: calculateSalaryMatch(salaryExpectation, job.salary || {})
        }
      });
    }

    recommendations.sort((a, b) => b.matchScore - a.matchScore);
    const topRecommendations = recommendations.slice(0, 10);

    if (topRecommendations.length > 0) {
      await JobRecommendation.insertMany(topRecommendations);
      await Notification.create({
        user: userId,
        type: 'job_recommendation',
        title: `We found ${topRecommendations.length} smart matches for you`,
        description: 'Your AI-powered recommendations are ready.',
        actionUrl: '/recommendations'
      });
    }

    res.status(200).json({
      success: true,
      message: `Generated ${topRecommendations.length} recommendations`,
      data: topRecommendations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

    res.status(200).json({ success: true, data: recommendation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

    res.status(200).json({ success: true, message: 'Recommendation dismissed', data: recommendation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

function calculateMatchScore(userSkills, userExperience, salaryExpectation, job) {
  const skillMatch = calculateSkillMatch(userSkills, (job.skills || []).map((skill) => skill.toLowerCase()));
  const experienceMatch = calculateExperienceMatch(userExperience, job.experienceLevel);
  const locationMatch = calculateLocationMatch('', (job.location || '').toLowerCase());
  const salaryMatch = calculateSalaryMatch(salaryExpectation, job.salary || {});

  return Math.round((skillMatch * 0.4) + (experienceMatch * 0.25) + (locationMatch * 0.2) + (salaryMatch * 0.15));
}

function calculateSkillMatch(userSkills, jobSkills) {
  if (!jobSkills.length) return 50;

  const matchedSkills = userSkills.filter((skill) =>
    jobSkills.some((jSkill) => jSkill.includes(skill))
  ).length;

  return Math.round((matchedSkills / jobSkills.length) * 100);
}

function calculateExperienceMatch(userExperience, jobExperienceLevel) {
  const levelMap = { Entry: 1, Mid: 3, Senior: 5 };
  const requiredLevel = levelMap[jobExperienceLevel] || 2;
  const normalizedUserExperience = userExperience || 0;
  if (normalizedUserExperience >= requiredLevel) return 100;
  return Math.round((normalizedUserExperience / requiredLevel) * 100);
}

function calculateLocationMatch(userLocation, jobLocation) {
  if (!userLocation || !jobLocation) return 60;
  return jobLocation.includes(userLocation) ? 100 : 60;
}

function calculateSalaryMatch(userSalary, jobSalary) {
  const userMin = Number(userSalary?.min) || 0;
  const jobMin = Number(jobSalary?.min) || 0;
  const jobMax = Number(jobSalary?.max) || Infinity;

  if (!userMin) return 70;
  if (userMin >= jobMin && userMin <= jobMax) return 100;
  if (userMin > jobMax) return Math.max(0, 100 - ((userMin - jobMax) / jobMax) * 10);
  return Math.max(0, 100 - ((jobMin - userMin) / userMin) * 10);
}
