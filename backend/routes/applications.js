const express = require('express');
const {
  applyForJob,
  getSeekerApplications,
  getEmployerApplications,
  getEmployerInterviews,
  getJobApplications,
  updateApplicationStatus,
  getApplication
} = require('../controllers/applicationController');
const { protect, isJobSeeker, isEmployer } = require('../middleware/auth');

const router = express.Router();

// Job seeker routes
router.post('/', protect, isJobSeeker, applyForJob);
router.get('/seeker/my', protect, isJobSeeker, getSeekerApplications);

// Employer routes
router.get('/employer/all', protect, isEmployer, getEmployerApplications);
router.get('/employer/interviews', protect, isEmployer, getEmployerInterviews);
router.get('/job/:jobId', protect, isEmployer, getJobApplications);
router.put('/:id', protect, isEmployer, updateApplicationStatus);

// Get single application
router.get('/:id', protect, getApplication);

module.exports = router;
