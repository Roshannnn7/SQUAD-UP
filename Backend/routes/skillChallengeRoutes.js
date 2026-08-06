const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    createChallenge,
    getChallenges,
    submitToChallenge,
    voteOnSubmission,
    getSubmissions,
    declareWinner,
} = require('../controllers/skillChallengeController');

// Squad challenge routes
router.post('/:projectId', protect, createChallenge);
router.get('/:projectId', protect, getChallenges);

// Challenge-specific routes
router.post('/challenge/:challengeId/submit', protect, submitToChallenge);
router.get('/challenge/:challengeId/submissions', protect, getSubmissions);
router.put('/challenge/:challengeId/winner/:submissionId', protect, declareWinner);

// Submission routes
router.post('/submissions/:submissionId/vote', protect, voteOnSubmission);

module.exports = router;
