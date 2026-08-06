const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getMilestones,
    createMilestone,
    updateMilestone,
    deleteMilestone,
} = require('../controllers/milestoneController');

router.get('/:projectId', protect, getMilestones);
router.post('/:projectId', protect, createMilestone);
router.put('/:milestoneId', protect, updateMilestone);
router.delete('/:milestoneId', protect, deleteMilestone);

module.exports = router;
