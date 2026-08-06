const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    updateStatus,
    updatePreferences,
    updateProfile,
    getUserDirectory,
    updateStreak,
    awardPoints,
    getLeaderboard,
} = require('../controllers/userEnhancementsController');

router.put('/status', protect, updateStatus);
router.put('/preferences', protect, updatePreferences);
router.put('/profile', protect, updateProfile);
router.get('/directory', protect, getUserDirectory);
router.post('/streak', protect, updateStreak);
router.post('/points', protect, awardPoints);
router.get('/leaderboard', protect, getLeaderboard);

module.exports = router;
