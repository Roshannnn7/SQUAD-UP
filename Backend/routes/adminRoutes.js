const express = require('express');
const router = express.Router();
const {
    getPlatformStats,
    getUsers,
    verifyMentor,
    updateUserStatus,
    getAdminBookings,
    getAdminProjects,
    deleteUser,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

// All routes are protected and require admin role
router.use(protect);
router.use(admin);

router.get('/stats', getPlatformStats);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/status', updateUserStatus);
router.put('/mentors/:id/verify', verifyMentor);
router.get('/bookings', getAdminBookings);
router.get('/projects', getAdminProjects);

module.exports = router;
