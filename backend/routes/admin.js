const express = require('express');
const {
  getDashboardStats,
  getAllUsers,
  approveUser,
  deleteUser,
  getAllJobs,
  updateJobStatus
} = require('../controllers/adminController');
const { protect, authorize, isAdmin } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, isAdmin);

// Stats and dashboard
router.get('/stats', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/approve', approveUser);
router.delete('/users/:id', deleteUser);

// Job management
router.get('/jobs', getAllJobs);
router.put('/jobs/:id', updateJobStatus);

module.exports = router;
