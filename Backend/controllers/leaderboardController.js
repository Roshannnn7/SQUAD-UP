const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Get leaderboard (top users by XP points)
// @route   GET /api/leaderboard
// @access  Public
const getLeaderboard = asyncHandler(async (req, res) => {
    const { period = 'alltime', limit = 50 } = req.query;

    // Build date filter for time-based leaderboards
    let dateFilter = {};
    if (period === 'weekly') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        dateFilter = { updatedAt: { $gte: weekAgo } };
    } else if (period === 'monthly') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        dateFilter = { updatedAt: { $gte: monthAgo } };
    }

    const users = await User.find({
        role: 'student',
        isActive: true,
        ...dateFilter,
    })
        .select('fullName profilePhoto points level badges streak skills headline location')
        .sort({ points: -1 })
        .limit(parseInt(limit));

    // Add rank to each user
    const leaderboard = users.map((user, index) => ({
        rank: index + 1,
        _id: user._id,
        fullName: user.fullName,
        profilePhoto: user.profilePhoto,
        points: user.points,
        level: user.level,
        badges: user.badges,
        streak: user.streak,
        skills: user.skills?.slice(0, 3),
        headline: user.headline,
    }));

    res.json({ leaderboard, period });
});

// @desc    Get a single user's rank and stats
// @route   GET /api/leaderboard/my-rank
// @access  Private
const getMyRank = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Count how many users have more points
    const usersAhead = await User.countDocuments({
        role: 'student',
        isActive: true,
        points: { $gt: req.user.points },
    });

    const rank = usersAhead + 1;

    // Get top 3 for context
    const top3 = await User.find({ role: 'student', isActive: true })
        .select('fullName profilePhoto points level badges streak')
        .sort({ points: -1 })
        .limit(3);

    res.json({
        rank,
        points: req.user.points,
        level: req.user.level,
        badges: req.user.badges,
        streak: req.user.streak,
        top3,
    });
});

// @desc    Award XP to a user (internal helper, also used by other controllers)
// @route   POST /api/leaderboard/award-xp
// @access  Private
const awardXP = asyncHandler(async (req, res) => {
    const { amount, reason } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.points = (user.points || 0) + parseInt(amount);

    // Level up: every 500 points = 1 level
    user.level = Math.floor(user.points / 500) + 1;

    // Update streak
    const today = new Date().toDateString();
    const lastActive = user.streak?.lastActiveDate
        ? new Date(user.streak.lastActiveDate).toDateString()
        : null;

    if (lastActive !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastActive === yesterday.toDateString()) {
            // Consecutive day
            user.streak.current = (user.streak.current || 0) + 1;
            user.streak.longest = Math.max(user.streak.current, user.streak.longest || 0);
        } else {
            // Streak broken
            user.streak.current = 1;
        }
        user.streak.lastActiveDate = new Date();
    }

    await user.save();

    res.json({
        message: `Awarded ${amount} XP for: ${reason}`,
        newPoints: user.points,
        level: user.level,
        streak: user.streak,
    });
});

// Helper function to award XP without HTTP context (for use in other controllers)
const awardXPInternal = async (userId, amount) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        user.points = (user.points || 0) + amount;
        user.level = Math.floor(user.points / 500) + 1;

        const today = new Date().toDateString();
        const lastActive = user.streak?.lastActiveDate
            ? new Date(user.streak.lastActiveDate).toDateString()
            : null;

        if (lastActive !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (lastActive === yesterday.toDateString()) {
                user.streak.current = (user.streak.current || 0) + 1;
                user.streak.longest = Math.max(user.streak.current, user.streak.longest || 0);
            } else {
                user.streak.current = 1;
            }
            user.streak.lastActiveDate = new Date();
        }

        await user.save();
    } catch (err) {
        console.error('XP award error:', err.message);
    }
};

module.exports = {
    getLeaderboard,
    getMyRank,
    awardXP,
    awardXPInternal,
};
