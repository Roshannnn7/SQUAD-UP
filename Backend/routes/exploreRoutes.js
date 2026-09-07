const express = require('express');
const router = express.Router();
const { getExplore, getSuggestedUsers, getSquadHealth, getRecommendedSquads } = require('../controllers/exploreController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getExplore);
router.get('/suggested-users', protect, getSuggestedUsers);
router.get('/recommended-squads', protect, getRecommendedSquads);
router.get('/squad-health/:id', protect, getSquadHealth);

module.exports = router;
