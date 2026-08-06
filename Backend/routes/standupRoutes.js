const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    submitStandUp,
    getTodayStandUps,
    getStandUpHistory,
    getMyStandUpStreak,
} = require('../controllers/standupController');

router.post('/:projectId', protect, submitStandUp);
router.get('/:projectId/today', protect, getTodayStandUps);
router.get('/:projectId/history', protect, getStandUpHistory);
router.get('/:projectId/my-streak', protect, getMyStandUpStreak);

module.exports = router;
