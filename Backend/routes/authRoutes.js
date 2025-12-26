const express = require('express');
const router = express.Router();
const {
    verifyFirebaseToken,
    completeStudentProfile,
    completeMentorProfile,
    getMe,
    updateProfile,
    getUserProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/verify', verifyFirebaseToken);
router.put('/complete-student-profile', protect, completeStudentProfile);
router.put('/complete-mentor-profile', protect, completeMentorProfile);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/profile/:id', protect, getUserProfile);

module.exports = router;
