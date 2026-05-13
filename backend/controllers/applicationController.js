const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private (Job Seeker only)
exports.applyForJob = async (req, res, next) => {
  try {
    const { jobId, fullName, email, phone, currentPosition, experience, coverLetter } = req.body;

    // Validation
    if (!jobId || !fullName || !email || !phone || !experience) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Handle CV file
    let cvPath = '';
    if (req.file) {
      cvPath = `/uploads/${req.file.filename}`;
    }

    // Create application
    const application = await Application.create({
      job: jobId,
      applicant: req.user._id,
      fullName,
      email,
      phone,
      currentPosition: currentPosition || '',
      experience,
      resume: cvPath || '',
      coverLetter: coverLetter || ''
    });

    // Update job applicants count
    await Job.findByIdAndUpdate(jobId, {
      $inc: { applicationCount: 1 },
      $push: { applicants: application._id }
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all applications for job seeker
// @route   GET /api/applications/seeker/my
// @access  Private (Job Seeker only)
exports.getSeekerApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('job', 'title location salary jobType company')
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all applications for employer's jobs
// @route   GET /api/applications/employer/all
// @access  Private (Employer only)
exports.getEmployerApplications = async (req, res, next) => {
  try {
    const applications = await Application.find()
      .populate({
        path: 'job',
        match: { employer: req.user._id }
      })
      .populate('applicant', 'fullName email phone skills')
      .sort({ appliedAt: -1 });

    // Filter out applications for other employers' jobs
    const filteredApplications = applications.filter(app => app.job !== null);

    res.status(200).json({
      success: true,
      count: filteredApplications.length,
      data: filteredApplications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get applications for specific job
// @route   GET /api/applications/job/:jobId
// @access  Private (Employer only)
exports.getJobApplications = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is the job owner
    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view applications for this job'
      });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'fullName email phone skills location')
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id
// @access  Private (Employer only)
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status'
      });
    }

    let application = await Application.findById(req.params.id).populate('job');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user is the job owner
    if (application.job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }

    application.status = status;
    
    if (status === 'reviewed') {
      application.reviewedAt = new Date();
    } else if (status === 'rejected') {
      application.rejectedAt = new Date();
    } else if (status === 'accepted') {
      application.acceptedAt = new Date();
    }

    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private
exports.getApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job')
      .populate('applicant', 'fullName email phone skills location');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
