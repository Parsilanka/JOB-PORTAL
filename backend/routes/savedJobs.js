const express = require('express');
const {
  getSavedJobs,
  toggleSavedJob,
  removeSavedJob
} = require('../controllers/savedJobController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getSavedJobs);
router.post('/toggle', protect, toggleSavedJob);
router.delete('/:jobId', protect, removeSavedJob);

module.exports = router;
