const asyncHandler = require('express-async-handler');
const SquadTemplate = require('../models/SquadTemplate');
const Project = require('../models/Project');
const SquadRule = require('../models/SquadRule');
const Task = require('../models/Task');

// @desc    Get all squad templates
// @route   GET /api/templates
// @access  Public
const getTemplates = asyncHandler(async (req, res) => {
    const { category } = req.query;
    const query = {};

    if (category) {
        query.category = category;
    }

    const templates = await SquadTemplate.find(query)
        .sort({ isOfficial: -1, usageCount: -1 });

    res.json(templates);
});

// @desc    Create squad from template
// @route   POST /api/templates/:id/create-squad
// @access  Protected
const createSquadFromTemplate = asyncHandler(async (req, res) => {
    const template = await SquadTemplate.findById(req.params.id);

    if (!template) {
        res.status(404);
        throw new Error('Template not found');
    }

    const { name, description, customizations } = req.body;

    // Create the squad
    const project = await Project.create({
        name: name || template.name,
        description: description || template.description,
        creator: req.user._id,
        category: template.category,
        skillsRequired: template.suggestedSkills,
        discoveryTags: template.defaultTags,
        members: [{
            user: req.user._id,
            role: 'admin',
            joinedAt: new Date(),
        }],
        createdFromTemplate: template._id,
        chatRoomId: `squad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });

    // Create default rules
    const rulePromises = template.defaultRules.map((rule, index) =>
        SquadRule.create({
            project: project._id,
            createdBy: req.user._id,
            title: rule.title,
            description: rule.description,
            order: index,
        })
    );

    await Promise.all(rulePromises);

    // Create default tasks if template has them
    if (template.taskTemplate && template.taskTemplate.length > 0) {
        const taskPromises = template.taskTemplate.map((task, index) =>
            Task.create({
                project: project._id,
                title: task.title,
                description: task.description,
                status: task.status,
                createdBy: req.user._id,
                order: index,
            })
        );

        await Promise.all(taskPromises);
    }

    // Increment usage count
    template.usageCount += 1;
    await template.save();

    const populatedProject = await Project.findById(project._id)
        .populate('creator', 'fullName profilePhoto email')
        .populate('members.user', 'fullName profilePhoto email');

    res.status(201).json(populatedProject);
});

// @desc    Create new template (Admin only)
// @route   POST /api/templates
// @access  Protected (Admin)
const createTemplate = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized');
    }

    const {
        name,
        description,
        category,
        icon,
        defaultRules,
        suggestedSkills,
        defaultTags,
        taskTemplate,
        isOfficial,
    } = req.body;

    const template = await SquadTemplate.create({
        name,
        description,
        category,
        icon: icon || '🚀',
        defaultRules: defaultRules || [],
        suggestedSkills: suggestedSkills || [],
        defaultTags: defaultTags || [],
        taskTemplate: taskTemplate || [],
        isOfficial: isOfficial || false,
    });

    res.status(201).json(template);
});

// @desc    Update template (Admin only)
// @route   PUT /api/templates/:id
// @access  Protected (Admin)
const updateTemplate = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized');
    }

    const template = await SquadTemplate.findById(req.params.id);

    if (!template) {
        res.status(404);
        throw new Error('Template not found');
    }

    const {
        name,
        description,
        category,
        icon,
        defaultRules,
        suggestedSkills,
        defaultTags,
        taskTemplate,
        isOfficial,
    } = req.body;

    template.name = name || template.name;
    template.description = description || template.description;
    template.category = category || template.category;
    template.icon = icon || template.icon;
    template.defaultRules = defaultRules || template.defaultRules;
    template.suggestedSkills = suggestedSkills || template.suggestedSkills;
    template.defaultTags = defaultTags || template.defaultTags;
    template.taskTemplate = taskTemplate || template.taskTemplate;
    template.isOfficial = isOfficial !== undefined ? isOfficial : template.isOfficial;

    await template.save();
    res.json(template);
});

// @desc    Delete template (Admin only)
// @route   DELETE /api/templates/:id
// @access  Protected (Admin)
const deleteTemplate = asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized');
    }

    const template = await SquadTemplate.findById(req.params.id);

    if (!template) {
        res.status(404);
        throw new Error('Template not found');
    }

    await template.deleteOne();
    res.json({ message: 'Template deleted' });
});

module.exports = {
    getTemplates,
    createSquadFromTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
};
