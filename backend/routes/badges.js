const express = require('express');
const { protect } = require('../middleware/auth');
const { getUserBadges } = require('../controllers/badgeController');

const router = express.Router();

router.get('/me', protect, getUserBadges);

module.exports = router;
