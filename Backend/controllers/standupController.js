const asyncHandler = require('express-async-handler');
const StandUp = require('../models/StandUp');
const Project = require('../models/Project');
const { awardXPInternal } = require('./leaderboardController');

// @desc    Submit or update today's stand-up for a squad
// @route   POST /api/standups/:projectId
// @access  Private
const submitStandUp = asyncHandler(async (req, res) => {
    const { yesterday, today, blockers, mood } = req.body;
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Squad not found');
    }

    // Check if user is a member
    const isMember = project.members.some(
        (m) => m.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
        res.status(403);
        throw new Error('You are not a member of this squad');
    }

    const todayDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Upsert: update if exists, create if not
    const standUp = await StandUp.findOneAndUpdate(
        { project: projectId, user: req.user._id, date: todayDate },
        { yesterday, today, blockers: blockers || 'No blockers', mood: mood || 'good' },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('user', 'fullName profilePhoto');

    // Award XP for daily stand-up (10 XP)
    await awardXPInternal(req.user._id, 10);

    res.status(201).json(standUp);
});

// @desc    Get today's stand-ups for a squad
// @route   GET /api/standups/:projectId/today
// @access  Private
const getTodayStandUps = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const todayDate = new Date().toISOString().split('T')[0];

    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Squad not found');
    }

    const isMember = project.members.some(
        (m) => m.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
        res.status(403);
        throw new Error('Not a member of this squad');
    }

    const standUps = await StandUp.find({ project: projectId, date: todayDate })
        .populate('user', 'fullName profilePhoto status')
        .sort({ createdAt: -1 });

    // Check if current user has submitted
    const myStandUp = standUps.find(
        (s) => s.user._id.toString() === req.user._id.toString()
    );

    // Get member count for completion stats
    const memberCount = project.members.length;

    res.json({
        standUps,
        myStandUp: myStandUp || null,
        date: todayDate,
        completionRate: Math.round((standUps.length / memberCount) * 100),
        memberCount,
    });
});

// @desc    Get stand-up history for a squad
// @route   GET /api/standups/:projectId/history
// @access  Private
const getStandUpHistory = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { days = 7 } = req.query;

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    const standUps = await StandUp.find({
        project: projectId,
        createdAt: { $gte: daysAgo },
    })
        .populate('user', 'fullName profilePhoto')
        .sort({ date: -1, createdAt: -1 });

    // Group by date
    const grouped = standUps.reduce((acc, s) => {
        if (!acc[s.date]) acc[s.date] = [];
        acc[s.date].push(s);
        return acc;
    }, {});

    res.json({ history: grouped, days: parseInt(days) });
});

// @desc    Get my stand-up streak for a squad
// @route   GET /api/standups/:projectId/my-streak
// @access  Private
const getMyStandUpStreak = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const standUps = await StandUp.find({
        project: projectId,
        user: req.user._id,
    }).sort({ date: -1 });

    let streak = 0;
    const today = new Date();

    for (let i = 0; i < standUps.length; i++) {
        const expectedDate = new Date(today);
        expectedDate.setDate(expectedDate.getDate() - i);
        const expectedStr = expectedDate.toISOString().split('T')[0];

        if (standUps[i].date === expectedStr) {
            streak++;
        } else {
            break;
        }
    }

    res.json({ streak, total: standUps.length });
});

module.exports = {
    submitStandUp,
    getTodayStandUps,
    getStandUpHistory,
    getMyStandUpStreak,
};
