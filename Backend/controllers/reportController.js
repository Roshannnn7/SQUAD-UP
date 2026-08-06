const asyncHandler = require('express-async-handler');
const Report = require('../models/Report');
const User = require('../models/User');
const Project = require('../models/Project');
const Message = require('../models/Message');

// @desc    Create a report
// @route   POST /api/reports
// @access  Private
const createReport = asyncHandler(async (req, res) => {
    const { reportType, targetId, reason, description } = req.body;

    // Validate target exists
    let targetExists = false;
    switch (reportType) {
        case 'user':
            targetExists = await User.findById(targetId);
            break;
        case 'project':
            targetExists = await Project.findById(targetId);
            break;
        case 'message':
        case 'post':
            targetExists = await Message.findById(targetId);
            break;
    }

    if (!targetExists) {
        res.status(404);
        throw new Error(`${reportType} not found`);
    }

    // Check if user already reported this target
    const existingReport = await Report.findOne({
        reportedBy: req.user._id,
        targetId,
        reportType,
        status: { $in: ['pending', 'reviewing'] },
    });

    if (existingReport) {
        res.status(400);
        throw new Error('You have already reported this');
    }

    const report = await Report.create({
        reportedBy: req.user._id,
        reportType,
        targetId,
        reason,
        description,
    });

    res.status(201).json(report);
});

// @desc    Get all reports (Admin only)
// @route   GET /api/reports
// @access  Private/Admin
const getReports = asyncHandler(async (req, res) => {
    const { status, reportType, page = 1, limit = 20 } = req.query;

    let query = {};

    if (status) {
        query.status = status;
    }

    if (reportType) {
        query.reportType = reportType;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reports = await Report.find(query)
        .populate('reportedBy', 'fullName email profilePhoto')
        .populate('reviewedBy', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Report.countDocuments(query);

    res.json({
        reports,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        total,
    });
});

// @desc    Get single report
// @route   GET /api/reports/:id
// @access  Private/Admin
const getReportById = asyncHandler(async (req, res) => {
    const report = await Report.findById(req.params.id)
        .populate('reportedBy', 'fullName email profilePhoto')
        .populate('reviewedBy', 'fullName email');

    if (!report) {
        res.status(404);
        throw new Error('Report not found');
    }

    res.json(report);
});

// @desc    Update report status (Admin only)
// @route   PUT /api/reports/:id
// @access  Private/Admin
const updateReport = asyncHandler(async (req, res) => {
    const { status, resolution, actionTaken } = req.body;

    const report = await Report.findById(req.params.id);

    if (!report) {
        res.status(404);
        throw new Error('Report not found');
    }

    if (status) {
        report.status = status;
    }

    if (resolution) {
        report.resolution = resolution;
    }

    if (actionTaken) {
        report.actionTaken = actionTaken;
    }

    if (status === 'resolved' || status === 'dismissed') {
        report.reviewedBy = req.user._id;
        report.reviewedAt = new Date();
    }

    await report.save();

    res.json(report);
});

// @desc    Delete report (Admin only)
// @route   DELETE /api/reports/:id
// @access  Private/Admin
const deleteReport = asyncHandler(async (req, res) => {
    const report = await Report.findById(req.params.id);

    if (!report) {
        res.status(404);
        throw new Error('Report not found');
    }

    await report.deleteOne();

    res.json({ message: 'Report deleted successfully' });
});

module.exports = {
    createReport,
    getReports,
    getReportById,
    updateReport,
    deleteReport,
};
