const express = require('express');
const router = express.Router();
const {
    getMentors,
    getMentorById,
    getMentorAvailability,
    addAvailability,
    updateAvailability,
    deleteAvailability,
    getMentorStats,
    getMyAvailability,
} = require('../controllers/mentorController');
const { protect, mentor } = require('../middleware/auth');

router.get('/', getMentors);
router.get('/:id', getMentorById);
router.get('/:id/availability', getMentorAvailability);

// Protected routes
router.post('/availability', protect, mentor, addAvailability);
router.put('/availability/:id', protect, mentor, updateAvailability);
router.delete('/availability/:id', protect, mentor, deleteAvailability);
router.get('/dashboard/stats', protect, mentor, getMentorStats);
router.get('/availability/me', protect, mentor, getMyAvailability);

module.exports = router;
