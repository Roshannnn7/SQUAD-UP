const express = require('express');
const router = express.Router();
const { submitReview, getMentorReviews, canReview } = require('../controllers/mentorReviewController');
const { protect } = require('../middleware/auth');

router.get('/:mentorId', getMentorReviews);
router.get('/:mentorId/can-review', protect, canReview);
router.post('/:mentorId', protect, submitReview);

module.exports = router;
