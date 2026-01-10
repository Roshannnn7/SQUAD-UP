const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const User = require('../models/User');
const Message = require('../models/Message');
const SquadActivityLog = require('../models/SquadActivityLog');
const SquadRule = require('../models/SquadRule');
const JoinRequest = require('../models/JoinRequest');
const Report = require('../models/Report');
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
        requireJoinApproval,
        discoveryTags,
        category,
    } = req.body;

    // Generate unique chat room ID
    const chatRoomId = crypto.randomBytes(16).toString('hex');

    const project = await Project.create({
        name,
        description,
        creator: req.user._id,
        members: [{
            user: req.user._id,
            role: 'admin',
        }],
        skillsRequired: Array.isArray(skillsRequired)
            ? skillsRequired
            : skillsRequired.split(',').map(s => s.trim()),
        githubRepo,
        maxMembers: maxMembers || 10,
        isPublic: isPublic !== false,
        requireJoinApproval: requireJoinApproval || false,
        discoveryTags: discoveryTags || [],
        category: category || 'other',
        chatRoomId,
    });

    // Log activity
    await SquadActivityLog.create({
        project: project._id,
        user: req.user._id,
        action: 'project_created',
        description: `${req.user.fullName} created the squad "${name}"`,
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

    // Check if user is project admin or moderator
    const isAuthorized = project.members.some(
        member => member.user.toString() === req.user._id.toString() &&
            (member.role === 'admin' || member.role === 'moderator')
    );

    if (!isAuthorized && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('Not authorized to update project');
    }

    const updatedProject = await Project.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    ).populate('members.user', 'fullName profilePhoto');

    // Log activity
    await SquadActivityLog.create({
        project: project._id,
        user: req.user._id,
        action: 'project_updated',
        description: `${req.user.fullName} updated the squad settings`,
    });

    res.json(updatedProject);
});

// @desc    Delete project (Squad Admin Only)
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Only the creator (squad admin) can delete the squad
    if (project.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('Only the squad creator can delete this squad');
    }

    // Delete all related data
    await Promise.all([
        Message.deleteMany({ project: project._id }),
        SquadRule.deleteMany({ project: project._id }),
        JoinRequest.deleteMany({ project: project._id }),
        SquadActivityLog.deleteMany({ project: project._id }),
        Report.deleteMany({ targetId: project._id, reportType: 'project' }),
    ]);

    await project.deleteOne();

    res.json({ message: 'Squad and all related data removed successfully' });
});

// @desc    Join project or request to join
// @route   POST /api/projects/:id/join
// @access  Private
const joinProject = asyncHandler(async (req, res) => {
    const { reason } = req.body;
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

    // If join approval is required, create a join request
    if (project.requireJoinApproval) {
        const existingRequest = await JoinRequest.findOne({
            project: project._id,
            user: req.user._id,
            status: 'pending',
        });

        if (existingRequest) {
            res.status(400);
            throw new Error('You already have a pending join request');
        }

        const joinRequest = await JoinRequest.create({
            project: project._id,
            user: req.user._id,
            reason: reason || 'I would like to join this squad',
        });

        return res.json({
            message: 'Join request submitted successfully. Waiting for approval.',
            joinRequest,
        });
    }

    // Add user as member directly
    project.members.push({
        user: req.user._id,
        role: 'member',
        joinedAt: new Date(),
    });

    await project.save();

    // Log activity
    await SquadActivityLog.create({
        project: project._id,
        user: req.user._id,
        action: 'member_joined',
        description: `${req.user.fullName} joined the squad`,
    });

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

    // Check if user is the admin (creator)
    if (project.members[memberIndex].role === 'admin') {
        res.status(400);
        throw new Error('Squad admin cannot leave. Delete the squad or transfer admin role first.');
    }

    // Remove user from members
    project.members.splice(memberIndex, 1);
    await project.save();

    // Log activity
    await SquadActivityLog.create({
        project: project._id,
        user: req.user._id,
        action: 'member_left',
        description: `${req.user.fullName} left the squad`,
    });

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

    // Check if user is project admin or moderator
    const isAuthorized = project.members.some(
        member => member.user.toString() === req.user._id.toString() &&
            (member.role === 'admin' || member.role === 'moderator')
    );

    if (!isAuthorized && req.user.role !== 'admin') {
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

// @desc    Update member role (Admin/Moderator only)
// @route   PUT /api/projects/:id/members/:userId/role
// @access  Private
const updateMemberRole = asyncHandler(async (req, res) => {
    const { role } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Only admin can change roles
    const isAdmin = project.members.some(
        member => member.user.toString() === req.user._id.toString() && member.role === 'admin'
    );

    if (!isAdmin && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('Only squad admin can change member roles');
    }

    const memberIndex = project.members.findIndex(
        member => member.user.toString() === req.params.userId
    );

    if (memberIndex === -1) {
        res.status(404);
        throw new Error('Member not found');
    }

    // Cannot change admin role
    if (project.members[memberIndex].role === 'admin') {
        res.status(400);
        throw new Error('Cannot change admin role');
    }

    const oldRole = project.members[memberIndex].role;
    project.members[memberIndex].role = role;
    await project.save();

    // Log activity
    const targetUser = await User.findById(req.params.userId);
    await SquadActivityLog.create({
        project: project._id,
        user: req.user._id,
        action: 'role_changed',
        description: `${req.user.fullName} changed ${targetUser.fullName}'s role from ${oldRole} to ${role}`,
        metadata: { userId: req.params.userId, oldRole, newRole: role },
    });

    res.json({ message: 'Member role updated successfully', project });
});

// @desc    Remove member from squad (Admin/Moderator only)
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private
const removeMember = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Admin or moderator can remove members
    const isAuthorized = project.members.some(
        member => member.user.toString() === req.user._id.toString() &&
            (member.role === 'admin' || member.role === 'moderator')
    );

    if (!isAuthorized && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('Not authorized to remove members');
    }

    const memberIndex = project.members.findIndex(
        member => member.user.toString() === req.params.userId
    );

    if (memberIndex === -1) {
        res.status(404);
        throw new Error('Member not found');
    }

    // Cannot remove admin
    if (project.members[memberIndex].role === 'admin') {
        res.status(400);
        throw new Error('Cannot remove squad admin');
    }

    const removedUser = await User.findById(req.params.userId);
    project.members.splice(memberIndex, 1);
    await project.save();

    // Log activity
    await SquadActivityLog.create({
        project: project._id,
        user: req.user._id,
        action: 'member_removed',
        description: `${req.user.fullName} removed ${removedUser.fullName} from the squad`,
        metadata: { removedUserId: req.params.userId },
    });

    res.json({ message: 'Member removed successfully' });
});

// @desc    Get join requests for a squad
// @route   GET /api/projects/:id/join-requests
// @access  Private
const getJoinRequests = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Only admin and moderators can view join requests
    const isAuthorized = project.members.some(
        member => member.user.toString() === req.user._id.toString() &&
            (member.role === 'admin' || member.role === 'moderator')
    );

    if (!isAuthorized && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('Not authorized to view join requests');
    }

    const requests = await JoinRequest.find({
        project: req.params.id,
        status: 'pending',
    })
        .populate('user', 'fullName profilePhoto email')
        .sort({ createdAt: -1 });

    res.json(requests);
});

// @desc    Approve or reject join request
// @route   PUT /api/projects/:id/join-requests/:requestId
// @access  Private
const handleJoinRequest = asyncHandler(async (req, res) => {
    const { action, reviewNote } = req.body; // action: 'approve' or 'reject'

    const project = await Project.findById(req.params.id);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Only admin and moderators can handle join requests
    const isAuthorized = project.members.some(
        member => member.user.toString() === req.user._id.toString() &&
            (member.role === 'admin' || member.role === 'moderator')
    );

    if (!isAuthorized && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('Not authorized to handle join requests');
    }

    const joinRequest = await JoinRequest.findById(req.params.requestId).populate('user');
    if (!joinRequest) {
        res.status(404);
        throw new Error('Join request not found');
    }

    if (joinRequest.status !== 'pending') {
        res.status(400);
        throw new Error('Join request already processed');
    }

    if (action === 'approve') {
        // Check if project has space
        if (project.members.length >= project.maxMembers) {
            res.status(400);
            throw new Error('Project is full');
        }

        // Add user to project
        project.members.push({
            user: joinRequest.user._id,
            role: 'member',
            joinedAt: new Date(),
        });
        await project.save();

        joinRequest.status = 'approved';

        // Log activity
        await SquadActivityLog.create({
            project: project._id,
            user: req.user._id,
            action: 'join_request_approved',
            description: `${req.user.fullName} approved ${joinRequest.user.fullName}'s join request`,
        });
    } else {
        joinRequest.status = 'rejected';

        // Log activity
        await SquadActivityLog.create({
            project: project._id,
            user: req.user._id,
            action: 'join_request_rejected',
            description: `${req.user.fullName} rejected ${joinRequest.user.fullName}'s join request`,
        });
    }

    joinRequest.reviewedBy = req.user._id;
    joinRequest.reviewedAt = new Date();
    joinRequest.reviewNote = reviewNote;
    await joinRequest.save();

    res.json({ message: `Join request ${action}d successfully`, joinRequest });
});

// @desc    Get squad rules
// @route   GET /api/projects/:id/rules
// @access  Public
const getSquadRules = asyncHandler(async (req, res) => {
    const rules = await SquadRule.find({
        project: req.params.id,
        isActive: true,
    }).sort({ order: 1 });

    res.json(rules);
});

// @desc    Create squad rule
// @route   POST /api/projects/:id/rules
// @access  Private
const createSquadRule = asyncHandler(async (req, res) => {
    const { title, description, order } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Only admin and moderators can create rules
    const isAuthorized = project.members.some(
        member => member.user.toString() === req.user._id.toString() &&
            (member.role === 'admin' || member.role === 'moderator')
    );

    if (!isAuthorized && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('Not authorized to create rules');
    }

    const rule = await SquadRule.create({
        project: req.params.id,
        title,
        description,
        order: order || 0,
        createdBy: req.user._id,
    });

    // Log activity
    await SquadActivityLog.create({
        project: project._id,
        user: req.user._id,
        action: 'rule_added',
        description: `${req.user.fullName} added a new rule: "${title}"`,
    });

    res.status(201).json(rule);
});

// @desc    Update squad rule
// @route   PUT /api/projects/:id/rules/:ruleId
// @access  Private
const updateSquadRule = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Only admin and moderators can update rules
    const isAuthorized = project.members.some(
        member => member.user.toString() === req.user._id.toString() &&
            (member.role === 'admin' || member.role === 'moderator')
    );

    if (!isAuthorized && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('Not authorized to update rules');
    }

    const rule = await SquadRule.findByIdAndUpdate(
        req.params.ruleId,
        req.body,
        { new: true }
    );

    if (!rule) {
        res.status(404);
        throw new Error('Rule not found');
    }

    // Log activity
    await SquadActivityLog.create({
        project: project._id,
        user: req.user._id,
        action: 'rule_updated',
        description: `${req.user.fullName} updated a rule`,
    });

    res.json(rule);
});

// @desc    Delete squad rule
// @route   DELETE /api/projects/:id/rules/:ruleId
// @access  Private
const deleteSquadRule = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Only admin and moderators can delete rules
    const isAuthorized = project.members.some(
        member => member.user.toString() === req.user._id.toString() &&
            (member.role === 'admin' || member.role === 'moderator')
    );

    if (!isAuthorized && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('Not authorized to delete rules');
    }

    const rule = await SquadRule.findByIdAndDelete(req.params.ruleId);

    if (!rule) {
        res.status(404);
        throw new Error('Rule not found');
    }

    // Log activity
    await SquadActivityLog.create({
        project: project._id,
        user: req.user._id,
        action: 'rule_deleted',
        description: `${req.user.fullName} deleted a rule`,
    });

    res.json({ message: 'Rule deleted successfully' });
});

// @desc    Pin/Unpin message
// @route   PUT /api/projects/:id/messages/:messageId/pin
// @access  Private
const togglePinMessage = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Only admin and moderators can pin messages
    const isAuthorized = project.members.some(
        member => member.user.toString() === req.user._id.toString() &&
            (member.role === 'admin' || member.role === 'moderator')
    );

    if (!isAuthorized && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('Not authorized to pin messages');
    }

    const message = await Message.findById(req.params.messageId);
    if (!message) {
        res.status(404);
        throw new Error('Message not found');
    }

    const isPinning = !message.isPinned;
    message.isPinned = isPinning;

    if (isPinning) {
        message.pinnedBy = req.user._id;
        message.pinnedAt = new Date();

        // Add to project's pinned messages
        if (!project.pinnedMessages.includes(message._id)) {
            project.pinnedMessages.push(message._id);
        }

        // Log activity
        await SquadActivityLog.create({
            project: project._id,
            user: req.user._id,
            action: 'message_pinned',
            description: `${req.user.fullName} pinned a message`,
        });
    } else {
        message.pinnedBy = null;
        message.pinnedAt = null;

        // Remove from project's pinned messages
        project.pinnedMessages = project.pinnedMessages.filter(
            id => id.toString() !== message._id.toString()
        );

        // Log activity
        await SquadActivityLog.create({
            project: project._id,
            user: req.user._id,
            action: 'message_unpinned',
            description: `${req.user.fullName} unpinned a message`,
        });
    }

    await message.save();
    await project.save();

    res.json({ message: `Message ${isPinning ? 'pinned' : 'unpinned'} successfully`, messageData: message });
});

// @desc    Get activity logs for a squad
// @route   GET /api/projects/:id/activity
// @access  Private
const getActivityLogs = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const project = await Project.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // Check if user is a member
    const isMember = project.members.some(
        member => member.user.toString() === req.user._id.toString()
    );

    if (!isMember && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('Not authorized to view activity logs');
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const logs = await SquadActivityLog.find({ project: req.params.id })
        .populate('user', 'fullName profilePhoto')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await SquadActivityLog.countDocuments({ project: req.params.id });

    res.json({
        logs,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        total,
    });
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
};
