const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    createTask,
    getProjectTasks,
    updateTask,
    deleteTask,
    reorderTasks,
} = require('../controllers/taskController');

router.post('/', protect, createTask);
router.get('/project/:projectId', protect, getProjectTasks);
router.put('/reorder', protect, reorderTasks);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, deleteTask);

module.exports = router;
