const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Create task
// @route   POST /api/tasks
// @access  Protected
const createTask = asyncHandler(async (req, res) => {
    const { projectId, title, description, priority, assignedTo, dueDate, labels } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    const userMember = project.members.find(
        m => m.user.toString() === req.user._id.toString()
    );

    if (!userMember) {
        res.status(403);
        throw new Error('Not authorized');
    }

    const task = await Task.create({
        project: projectId,
        title,
        description,
        priority: priority || 'medium',
        assignedTo: assignedTo || [],
        createdBy: req.user._id,
        dueDate,
        labels: labels || [],
    });

    const populatedTask = await Task.findById(task._id)
        .populate('createdBy', 'fullName profilePhoto')
        .populate('assignedTo', 'fullName profilePhoto');

    res.status(201).json(populatedTask);
});

// @desc    Get tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Protected
const getProjectTasks = asyncHandler(async (req, res) => {
    const { status } = req.query;
    const query = { project: req.params.projectId };

    if (status) {
        query.status = status;
    }

    const tasks = await Task.find(query)
        .populate('createdBy', 'fullName profilePhoto')
        .populate('assignedTo', 'fullName profilePhoto')
        .sort({ order: 1, createdAt: -1 });

    res.json(tasks);
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Protected
const updateTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    const { title, description, status, priority, assignedTo, dueDate, labels, order } = req.body;

    task.title = title || task.title;
    task.description = description !== undefined ? description : task.description;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.assignedTo = assignedTo || task.assignedTo;
    task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;
    task.labels = labels || task.labels;
    task.order = order !== undefined ? order : task.order;

    await task.save();

    const populatedTask = await Task.findById(task._id)
        .populate('createdBy', 'fullName profilePhoto')
        .populate('assignedTo', 'fullName profilePhoto');

    res.json(populatedTask);
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Protected
const deleteTask = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id);

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    const project = await Project.findById(task.project);
    const userMember = project.members.find(
        m => m.user.toString() === req.user._id.toString()
    );

    const canDelete = task.createdBy.toString() === req.user._id.toString() ||
        (userMember && ['admin', 'moderator'].includes(userMember.role));

    if (!canDelete) {
        res.status(403);
        throw new Error('Not authorized');
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
});

// @desc    Reorder tasks
// @route   PUT /api/tasks/reorder
// @access  Protected
const reorderTasks = asyncHandler(async (req, res) => {
    const { tasks } = req.body; // Array of { id, order }

    const updatePromises = tasks.map(({ id, order }) =>
        Task.findByIdAndUpdate(id, { order })
    );

    await Promise.all(updatePromises);

    res.json({ message: 'Tasks reordered' });
});

module.exports = {
    createTask,
    getProjectTasks,
    updateTask,
    deleteTask,
    reorderTasks,
};
