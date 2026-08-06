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
    updateMemberRole,
    removeMember,
    getJoinRequests,
    handleJoinRequest,
    getSquadRules,
    createSquadRule,
    updateSquadRule,
    deleteSquadRule,
    togglePinMessage,
    getActivityLogs,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getProjects);
router.get('/my', protect, getMyProjects); // Specific route BEFORE dynamic :id
router.get('/:id', getProjectById);
router.get('/:id/rules', getSquadRules); // Public - anyone can view rules

// Protected routes
router.post('/', protect, createProject);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);
router.post('/:id/join', protect, joinProject);
router.post('/:id/leave', protect, leaveProject);
router.put('/:id/progress', protect, updateProgress);

// Member management
router.put('/:id/members/:userId/role', protect, updateMemberRole);
router.delete('/:id/members/:userId', protect, removeMember);

// Join requests
router.get('/:id/join-requests', protect, getJoinRequests);
router.put('/:id/join-requests/:requestId', protect, handleJoinRequest);

// Squad rules
router.post('/:id/rules', protect, createSquadRule);
router.put('/:id/rules/:ruleId', protect, updateSquadRule);
router.delete('/:id/rules/:ruleId', protect, deleteSquadRule);

// Messages
router.put('/:id/messages/:messageId/pin', protect, togglePinMessage);

// Activity logs
router.get('/:id/activity', protect, getActivityLogs);

module.exports = router;
