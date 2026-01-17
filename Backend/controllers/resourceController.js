const asyncHandler = require('express-async-handler');
const Resource = require('../models/Resource');
const Project = require('../models/Project');

// @desc    Add resource to project
// @route   POST /api/resources
// @access  Protected
const addResource = asyncHandler(async (req, res) => {
    const { projectId, title, description, url, type, tags } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    const isMember = project.members.some(
        member => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
        res.status(403);
        throw new Error('Not authorized to add resources to this squad');
    }

    const resource = await Resource.create({
        project: projectId,
        addedBy: req.user._id,
        title,
        description,
        url,
        type,
        tags: tags || [],
    });

    const populatedResource = await Resource.findById(resource._id)
        .populate('addedBy', 'fullName profilePhoto');

    res.status(201).json(populatedResource);
});

// @desc    Get resources for a project
// @route   GET /api/resources/project/:projectId
// @access  Protected
const getProjectResources = asyncHandler(async (req, res) => {
    const { type, tag, sort } = req.query;
    const query = { project: req.params.projectId };

    if (type) {
        query.type = type;
    }

    if (tag) {
        query.tags = tag;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'popular') {
        // Sort by upvotes - downvotes
        const resources = await Resource.find(query)
            .populate('addedBy', 'fullName profilePhoto')
            .lean();

        resources.forEach(resource => {
            resource.score = resource.upvotes.length - resource.downvotes.length;
        });

        resources.sort((a, b) => b.score - a.score);
        return res.json(resources);
    }

    const resources = await Resource.find(query)
        .populate('addedBy', 'fullName profilePhoto')
        .sort(sortOption);

    res.json(resources);
});

// @desc    Vote on resource
// @route   POST /api/resources/:id/vote
// @access  Protected
const voteResource = asyncHandler(async (req, res) => {
    const { voteType } = req.body; // 'up' or 'down'
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
        res.status(404);
        throw new Error('Resource not found');
    }

    const userId = req.user._id.toString();

    // Remove any existing votes
    resource.upvotes = resource.upvotes.filter(id => id.toString() !== userId);
    resource.downvotes = resource.downvotes.filter(id => id.toString() !== userId);

    // Add new vote
    if (voteType === 'up') {
        resource.upvotes.push(req.user._id);
    } else if (voteType === 'down') {
        resource.downvotes.push(req.user._id);
    }

    await resource.save();

    const populatedResource = await Resource.findById(resource._id)
        .populate('addedBy', 'fullName profilePhoto');

    res.json(populatedResource);
});

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Protected
const deleteResource = asyncHandler(async (req, res) => {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
        res.status(404);
        throw new Error('Resource not found');
    }

    // Check if user is the creator or admin/moderator
    const project = await Project.findById(resource.project);
    const userMember = project.members.find(
        m => m.user.toString() === req.user._id.toString()
    );

    const canDelete = resource.addedBy.toString() === req.user._id.toString() ||
        (userMember && ['admin', 'moderator'].includes(userMember.role));

    if (!canDelete) {
        res.status(403);
        throw new Error('Not authorized to delete this resource');
    }

    await resource.deleteOne();
    res.json({ message: 'Resource deleted' });
});

module.exports = {
    addResource,
    getProjectResources,
    voteResource,
    deleteResource,
};
