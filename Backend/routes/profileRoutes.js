const express = require('express');
const router = express.Router();
const {
    getUserProfile,
    getMyProfile,
    updateUserProfile,
    addExperience,
    updateExperience,
    deleteExperience,
    addEducation,
    updateEducation,
    deleteEducation,
    searchUsers,
} = require('../controllers/profileController');
const { protect, optionalAuth } = require('../middleware/auth');

// Profile routes
router.get('/search', searchUsers);
router.get('/me', protect, getMyProfile);
router.get('/:userId', optionalAuth, getUserProfile);
router.put('/', protect, updateUserProfile);

// Experience routes
router.post('/experience', protect, addExperience);
router.put('/experience/:experienceId', protect, updateExperience);
router.delete('/experience/:experienceId', protect, deleteExperience);

// Education routes
router.post('/education', protect, addEducation);
router.put('/education/:educationId', protect, updateEducation);
router.delete('/education/:educationId', protect, deleteEducation);

module.exports = router;
