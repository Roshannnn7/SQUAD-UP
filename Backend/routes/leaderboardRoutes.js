const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getLeaderboard,
    getMyRank,
    awardXP,
} = require('../controllers/leaderboardController');

router.get('/', getLeaderboard);
router.get('/my-rank', protect, getMyRank);
router.post('/award-xp', protect, awardXP);

module.exports = router;
