const asyncHandler = require('express-async-handler');
const Milestone = require('../models/Milestone');
const Project = require('../models/Project');
const SquadActivityLog = require('../models/SquadActivityLog');

// @desc    Get all milestones for a squad
// @route   GET /api/milestones/:projectId
// @access  Private (members)
const getMilestones = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Squad not found');
    }

    const isMember = project.members.some(
        (m) => m.user.toString() === req.user._id.toString()
    );
    if (!isMember && !project.isPublic) {
        res.status(403);
        throw new Error('Not a member of this squad');
    }

    // Auto-update overdue milestones
    const now = new Date();
    await Milestone.updateMany(
        {
            project: projectId,
            status: { $in: ['upcoming', 'in-progress'] },
            dueDate: { $lt: now },
        },
        { $set: { status: 'overdue' } }
    );

    const milestones = await Milestone.find({ project: projectId })
        .populate('createdBy', 'fullName profilePhoto')
        .sort({ order: 1, dueDate: 1 });

    // Calculate overall progress
    const total = milestones.length;
    const completed = milestones.filter((m) => m.status === 'completed').length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({ milestones, progress, total, completed });
});

// @desc    Create a milestone
// @route   POST /api/milestones/:projectId
// @access  Private (admin/moderator)
const createMilestone = asyncHandler(async (req, res) => {
    const { title, description, dueDate, color, order } = req.body;
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Squad not found');
    }

    const isAuthorized = project.members.some(
        (m) =>
            m.user.toString() === req.user._id.toString() &&
            (m.role === 'admin' || m.role === 'moderator')
    );
    if (!isAuthorized && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Only admin/moderator can add milestones');
    }

    // Get the max order
    const maxOrder = await Milestone.findOne({ project: projectId }).sort({ order: -1 });
    const nextOrder = maxOrder ? maxOrder.order + 1 : 0;

    const milestone = await Milestone.create({
        project: projectId,
        createdBy: req.user._id,
        title,
        description: description || '',
        dueDate: new Date(dueDate),
        color: color || '#6366f1',
        order: order !== undefined ? order : nextOrder,
    });

    await milestone.populate('createdBy', 'fullName profilePhoto');

    await SquadActivityLog.create({
        project: projectId,
        user: req.user._id,
        action: 'milestone_added',
        description: `${req.user.fullName} added milestone: "${title}"`,
    });

    res.status(201).json(milestone);
});

// @desc    Update a milestone
// @route   PUT /api/milestones/:milestoneId
// @access  Private (admin/moderator)
const updateMilestone = asyncHandler(async (req, res) => {
    const { milestoneId } = req.params;
    const { title, description, dueDate, status, color, order } = req.body;

    const milestone = await Milestone.findById(milestoneId);
    if (!milestone) {
        res.status(404);
        throw new Error('Milestone not found');
    }

    const project = await Project.findById(milestone.project);
    const isAuthorized = project.members.some(
        (m) =>
            m.user.toString() === req.user._id.toString() &&
            (m.role === 'admin' || m.role === 'moderator')
    );
    if (!isAuthorized && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Only admin/moderator can update milestones');
    }

    if (title) milestone.title = title;
    if (description !== undefined) milestone.description = description;
    if (dueDate) milestone.dueDate = new Date(dueDate);
    if (color) milestone.color = color;
    if (order !== undefined) milestone.order = order;

    if (status) {
        milestone.status = status;
        if (status === 'completed' && !milestone.completedAt) {
            milestone.completedAt = new Date();
        }
    }

    await milestone.save();
    await milestone.populate('createdBy', 'fullName profilePhoto');

    res.json(milestone);
});

// @desc    Delete a milestone
// @route   DELETE /api/milestones/:milestoneId
// @access  Private (admin/moderator)
const deleteMilestone = asyncHandler(async (req, res) => {
    const { milestoneId } = req.params;

    const milestone = await Milestone.findById(milestoneId);
    if (!milestone) {
        res.status(404);
        throw new Error('Milestone not found');
    }

    const project = await Project.findById(milestone.project);
    const isAuthorized = project.members.some(
        (m) =>
            m.user.toString() === req.user._id.toString() &&
            (m.role === 'admin' || m.role === 'moderator')
    );
    if (!isAuthorized && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Only admin/moderator can delete milestones');
    }

    await milestone.deleteOne();

    res.json({ message: 'Milestone deleted successfully' });
});

module.exports = {
    getMilestones,
    createMilestone,
    updateMilestone,
    deleteMilestone,
};
