const asyncHandler = require('express-async-handler');
const CodeSnippet = require('../models/CodeSnippet');
const Project = require('../models/Project');

// @desc    Create code snippet
// @route   POST /api/snippets
// @access  Protected
const createSnippet = asyncHandler(async (req, res) => {
    const { projectId, title, description, code, language, tags, isPublic } = req.body;

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
        throw new Error('Not authorized');
    }

    const snippet = await CodeSnippet.create({
        project: projectId,
        author: req.user._id,
        title,
        description,
        code,
        language,
        tags: tags || [],
        isPublic: isPublic !== false,
    });

    const populatedSnippet = await CodeSnippet.findById(snippet._id)
        .populate('author', 'fullName profilePhoto');

    res.status(201).json(populatedSnippet);
});

// @desc    Get snippets for a project
// @route   GET /api/snippets/project/:projectId
// @access  Protected
const getProjectSnippets = asyncHandler(async (req, res) => {
    const { language, tag } = req.query;
    const query = { project: req.params.projectId, isPublic: true };

    if (language) {
        query.language = language;
    }

    if (tag) {
        query.tags = tag;
    }

    const snippets = await CodeSnippet.find(query)
        .populate('author', 'fullName profilePhoto')
        .sort({ createdAt: -1 });

    res.json(snippets);
});

// @desc    Update snippet
// @route   PUT /api/snippets/:id
// @access  Protected
const updateSnippet = asyncHandler(async (req, res) => {
    const snippet = await CodeSnippet.findById(req.params.id);

    if (!snippet) {
        res.status(404);
        throw new Error('Snippet not found');
    }

    if (snippet.author.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized');
    }

    const { title, description, code, language, tags, isPublic } = req.body;

    snippet.title = title || snippet.title;
    snippet.description = description || snippet.description;
    snippet.code = code || snippet.code;
    snippet.language = language || snippet.language;
    snippet.tags = tags || snippet.tags;
    snippet.isPublic = isPublic !== undefined ? isPublic : snippet.isPublic;

    await snippet.save();

    const populatedSnippet = await CodeSnippet.findById(snippet._id)
        .populate('author', 'fullName profilePhoto');

    res.json(populatedSnippet);
});

// @desc    Delete snippet
// @route   DELETE /api/snippets/:id
// @access  Protected
const deleteSnippet = asyncHandler(async (req, res) => {
    const snippet = await CodeSnippet.findById(req.params.id);

    if (!snippet) {
        res.status(404);
        throw new Error('Snippet not found');
    }

    if (snippet.author.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized');
    }

    await snippet.deleteOne();
    res.json({ message: 'Snippet deleted' });
});

module.exports = {
    createSnippet,
    getProjectSnippets,
    updateSnippet,
    deleteSnippet,
};
