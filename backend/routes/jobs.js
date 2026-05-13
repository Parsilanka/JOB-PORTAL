const express = require('express');
const {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getEmployerJobs
} = require('../controllers/jobController');
const { protect, authorize, isEmployer } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAllJobs);
router.get('/:id', getJob);

// Protected routes
router.post('/', protect, isEmployer, createJob);
router.put('/:id', protect, isEmployer, updateJob);
router.delete('/:id', protect, isEmployer, deleteJob);
router.get('/employer/me', protect, isEmployer, getEmployerJobs);

module.exports = router;
