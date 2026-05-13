const express = require('express');
const {
  getUserProfile,
  updateUserProfile,
  getUser,
  getAllEmployers
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// Public routes
router.get('/:id', getUser);
router.get('/employers/all', getAllEmployers);

module.exports = router;
