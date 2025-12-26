const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const User = require('../models/User');
const crypto = require('crypto');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = asyncHandler(async (req, res) => {
    const {
        name,
        description,
        skillsRequired,
        githubRepo,
        maxMembers,
        isPublic,
    } = req.body;

    // Generate unique chat room ID
    const chatRoomId = crypto.randomBytes(16).toString('hex');

    const project = await Project.create({
        name,
        description,
        creator: req.user._id,
        members: [{
            user: req.user._id,
            role: 'leader',
        }],
        skillsRequired: Array.isArray(skillsRequired)
            ? skillsRequired
            : skillsRequired.split(',').map(s => s.trim()),
        githubRepo,
        maxMembers: maxMembers || 10,
        isPublic: isPublic !== false,
        chatRoomId,
    });

    res.status(201).json(project);
});

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
const getProjects = asyncHandler(async (req, res) => {
    const { search, skills, status, page = 1, limit = 10 } = req.query;

    let query = { isPublic: true };

    // Search by name or description
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
        ];
    }

    // Filter by skills
    if (skills) {
        query.skillsRequired = { $in: skills.split(',') };
    }

    // Filter by status
    if (status) {
        query.status = status;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const projects = await Project.find(query)
        .populate('creator', 'fullName profilePhoto')
        .populate('members.user', 'fullName profilePhoto')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Project.countDocuments(query);

    res.json({
        projects,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        total,
    });
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
const getProjectById = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id)
        .populate('creator', 'fullName profilePhoto email')
        .populate('members.user', 'fullName profilePhoto email');

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    res.json(project);
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Check if user is project leader or admin
    const isLeader = project.members.some(
        member => member.user.toString() === req.user._id.toString() && member.role === 'leader'
    );

    if (!isLeader && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('Not authorized to update project');
    }

    const updatedProject = await Project.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    ).populate('members.user', 'fullName profilePhoto');

    res.json(updatedProject);
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Check if user is project creator or admin
    if (project.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('Not authorized to delete project');
    }

    await project.deleteOne();

    res.json({ message: 'Project removed' });
});

// @desc    Join project
// @route   POST /api/projects/:id/join
// @access  Private
const joinProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Check if project is public
    if (!project.isPublic) {
        res.status(400);
        throw new Error('Project is private');
    }

    // Check if user is already a member
    const isMember = project.members.some(
        member => member.user.toString() === req.user._id.toString()
    );

    if (isMember) {
        res.status(400);
        throw new Error('Already a member of this project');
    }

    // Check if project has space
    if (project.members.length >= project.maxMembers) {
        res.status(400);
        throw new Error('Project is full');
    }

    // Add user as member
    project.members.push({
        user: req.user._id,
        role: 'member',
        joinedAt: new Date(),
    });

    await project.save();

    res.json({ message: 'Joined project successfully', project });
});

// @desc    Leave project
// @route   POST /api/projects/:id/leave
// @access  Private
const leaveProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Check if user is a member
    const memberIndex = project.members.findIndex(
        member => member.user.toString() === req.user._id.toString()
    );

    if (memberIndex === -1) {
        res.status(400);
        throw new Error('Not a member of this project');
    }

    // Check if user is the leader
    if (project.members[memberIndex].role === 'leader') {
        res.status(400);
        throw new Error('Leader cannot leave project. Transfer leadership first.');
    }

    // Remove user from members
    project.members.splice(memberIndex, 1);
    await project.save();

    res.json({ message: 'Left project successfully' });
});

// @desc    Update project progress
// @route   PUT /api/projects/:id/progress
// @access  Private
const updateProgress = asyncHandler(async (req, res) => {
    const { progress, status } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Check if user is project leader
    const isLeader = project.members.some(
        member => member.user.toString() === req.user._id.toString() && member.role === 'leader'
    );

    if (!isLeader && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('Not authorized to update progress');
    }

    if (progress !== undefined) {
        project.progress = Math.min(Math.max(progress, 0), 100);
    }

    if (status) {
        project.status = status;
    }

    await project.save();

    res.json(project);
});

// @desc    Get user's projects
// @route   GET /api/projects/my
// @access  Private
const getMyProjects = asyncHandler(async (req, res) => {
    const projects = await Project.find({
        'members.user': req.user._id,
    })
        .populate('creator', 'fullName profilePhoto')
        .populate('members.user', 'fullName profilePhoto')
        .sort({ updatedAt: -1 });

    res.json(projects);
});

module.exports = {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    joinProject,
    leaveProject,
    updateProgress,
    getMyProjects,
};
