const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createPoll,
    votePoll,
    getProjectPolls,
    closePoll,
    deletePoll,
} = require('../controllers/pollController');

router.post('/', protect, createPoll);
router.post('/:id/vote', protect, votePoll);
router.get('/project/:projectId', protect, getProjectPolls);
router.put('/:id/close', protect, closePoll);
router.delete('/:id', protect, deletePoll);

module.exports = router;
