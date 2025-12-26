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

router.get('/', getProjects);
router.get('/:id', getProjectById);

// Protected routes
router.post('/', protect, createProject);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);
router.post('/:id/join', protect, joinProject);
router.post('/:id/leave', protect, leaveProject);
router.put('/:id/progress', protect, updateProgress);
router.get('/my/projects', protect, getMyProjects);

module.exports = router;
