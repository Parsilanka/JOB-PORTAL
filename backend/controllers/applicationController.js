const nodemailer = require('nodemailer');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendInterviewNotification = async (application) => {
  const email = application.email || application.applicant?.email;
  const applicantName = application.fullName || application.applicant?.fullName || 'Applicant';
  const jobTitle = application.job?.title || 'the job';

  if (!email) {
    console.warn('No applicant email available for interview notification');
    return;
  }

  const interviewDate = application.interviewDate ? new Date(application.interviewDate).toLocaleDateString() : 'TBA';
  const interviewTime = application.interviewTime || 'TBA';
  const interviewMode = application.interviewMode || 'TBA';
  const interviewLink = application.interviewLink || 'TBA';
  const interviewNotes = application.interviewNotes || 'No additional notes.';

  const message = `
    <h1>Interview Scheduled</h1>
    <p>Hi ${applicantName},</p>
    <p>Your interview for <strong>${jobTitle}</strong> has been scheduled.</p>
    <p><strong>Date:</strong> ${interviewDate}</p>
    <p><strong>Time:</strong> ${interviewTime}</p>
    <p><strong>Mode:</strong> ${interviewMode}</p>
    <p><strong>Location / Link:</strong> ${interviewLink}</p>
    <p><strong>Notes:</strong> ${interviewNotes}</p>
    <p>Good luck!</p>
    <br />
    <p>Best regards,<br/>Job Portal Team</p>
  `;

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP credentials are not configured. Interview email content:', message);
    return;
  }

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Job Portal" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Interview Scheduled for ${jobTitle}`,
      html: message,
    });
  } catch (error) {
    console.error('Interview email send error:', error.message || error);
  }
};

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

exports.getEmployerInterviews = async (req, res, next) => {
  try {
    const applications = await Application.find({
      status: 'shortlisted',
      interviewDate: { $exists: true, $ne: null }
    })
      .populate({
        path: 'job',
        match: { employer: req.user._id }
      })
      .populate('applicant', 'fullName email phone skills location')
      .sort({ interviewDate: 1, interviewTime: 1 });

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
    const {
      status,
      interviewDate,
      interviewTime,
      interviewMode,
      interviewLink,
      interviewNotes
    } = req.body;

    if (!status && !interviewDate && !interviewTime && !interviewMode && !interviewLink && !interviewNotes) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status or interview details'
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

    if (status) {
      application.status = status;
    }

    if (interviewDate) {
      application.interviewDate = interviewDate;
    }
    if (interviewTime) {
      application.interviewTime = interviewTime;
    }
    if (interviewMode) {
      application.interviewMode = interviewMode;
    }
    if (interviewLink) {
      application.interviewLink = interviewLink;
    }
    if (interviewNotes) {
      application.interviewNotes = interviewNotes;
    }

    if (status === 'reviewed') {
      application.reviewedAt = new Date();
    } else if (status === 'rejected') {
      application.rejectedAt = new Date();
    } else if (status === 'accepted') {
      application.acceptedAt = new Date();
    }

    if (status === 'shortlisted' && (interviewDate || interviewTime || interviewLink || interviewMode || interviewNotes)) {
      application.interviewScheduledAt = new Date();
    }

    await application.save();

    if (status === 'shortlisted') {
      await sendInterviewNotification(application);
    }

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
