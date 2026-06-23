const express = require('express');
const {
  getDashboardStats,
  getAllUsers,
  approveUser,
  deleteUser,
  getAllJobs,
  updateJobStatus,
  getPendingJobs,
  approveJob,
  controlUserFeatures,
  getFinancialDashboard
} = require('../controllers/adminController');
const { protect, authorize, isAdmin } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, isAdmin);

// Stats and dashboard
router.get('/stats', getDashboardStats);
router.get('/finances', getFinancialDashboard);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/approve', approveUser);
router.put('/users/:id/features', controlUserFeatures);
router.delete('/users/:id', deleteUser);

// Job management
router.get('/jobs/pending', getPendingJobs);
router.get('/jobs', getAllJobs);
router.put('/jobs/:id/approve', approveJob);
router.put('/jobs/:id', updateJobStatus);

module.exports = router;
