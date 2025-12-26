const express = require('express');
const router = express.Router();
const {
    getPlatformStats,
    getUsers,
    verifyMentor,
    updateUserStatus,
    getAdminBookings,
    getAdminProjects,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

router.get('/stats', protect, admin, getPlatformStats);
router.get('/users', protect, admin, getUsers);
router.put('/mentors/:id/verify', protect, admin, verifyMentor);
router.put('/users/:id/status', protect, admin, updateUserStatus);
router.get('/bookings', protect, admin, getAdminBookings);
router.get('/projects', protect, admin, getAdminProjects);

module.exports = router;
