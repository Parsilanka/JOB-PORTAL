const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');

// @desc    Get all saved jobs for the current user
// @route   GET /api/saved-jobs
// @access  Private
exports.getSavedJobs = async (req, res, next) => {
  try {
    const savedJobs = await SavedJob.find({ user: req.user._id })
      .populate({
        path: 'job',
        populate: {
          path: 'employer',
          select: 'fullName companyName profilePicture bio'
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: savedJobs.length,
      data: savedJobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Save or unsave a job
// @route   POST /api/saved-jobs/toggle
// @access  Private
exports.toggleSavedJob = async (req, res, next) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const existing = await SavedJob.findOne({ user: req.user._id, job: jobId });

    if (existing) {
      await SavedJob.deleteOne({ _id: existing._id });
      return res.status(200).json({
        success: true,
        saved: false,
        message: 'Job removed from saved jobs'
      });
    }

    await SavedJob.create({ user: req.user._id, job: jobId });

    res.status(201).json({
      success: true,
      saved: true,
      message: 'Job saved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove a saved job
// @route   DELETE /api/saved-jobs/:jobId
// @access  Private
exports.removeSavedJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const result = await SavedJob.deleteOne({ user: req.user._id, job: jobId });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Saved job not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Saved job removed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
