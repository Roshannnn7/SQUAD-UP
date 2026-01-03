const express = require('express');
const router = express.Router();
const {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    joinProject,
    leaveProject,
    updateProgress,
    getMyProjects,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getProjects);
router.get('/my', protect, getMyProjects); // Specific route BEFORE dynamic :id
router.get('/:id', getProjectById);

// Protected routes
router.post('/', protect, createProject);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);
router.post('/:id/join', protect, joinProject);
router.post('/:id/leave', protect, leaveProject);
router.put('/:id/progress', protect, updateProgress);

module.exports = router;
