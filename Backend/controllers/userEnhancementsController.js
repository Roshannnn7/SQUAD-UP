const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Update user status
// @route   PUT /api/users/status
// @access  Protected
const updateStatus = asyncHandler(async (req, res) => {
    const { status, customStatus, doNotDisturb } = req.body;

    const user = await User.findById(req.user._id);

    if (status) {
        user.status = status;
    }
    if (customStatus !== undefined) {
        user.customStatus = customStatus;
    }
    if (doNotDisturb !== undefined) {
        user.doNotDisturb = doNotDisturb;
    }

    await user.save();
    res.json({ status: user.status, customStatus: user.customStatus, doNotDisturb: user.doNotDisturb });
});

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Protected
const updatePreferences = asyncHandler(async (req, res) => {
    const { theme, emailNotifications, pushNotifications } = req.body;

    const user = await User.findById(req.user._id);

    if (theme) {
        user.preferences.theme = theme;
    }
    if (emailNotifications !== undefined) {
        user.preferences.emailNotifications = emailNotifications;
    }
    if (pushNotifications !== undefined) {
        user.preferences.pushNotifications = pushNotifications;
    }

    await user.save();
    res.json(user.preferences);
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Protected
const updateProfile = asyncHandler(async (req, res) => {
    const { bio, coverPhoto, skills, interests, socialLinks } = req.body;

    const user = await User.findById(req.user._id);

    if (bio !== undefined) {
        user.bio = bio;
    }
    if (coverPhoto) {
        user.coverPhoto = coverPhoto;
    }
    if (skills) {
        user.skills = skills;
    }
    if (interests) {
        user.interests = interests;
    }
    if (socialLinks) {
        user.socialLinks = { ...user.socialLinks, ...socialLinks };
    }

    await user.save();
    res.json(user);
});

// @desc    Get user directory
// @route   GET /api/users/directory
// @access  Protected
const getUserDirectory = asyncHandler(async (req, res) => {
    const { role, skills, interests, search, page = 1, limit = 20 } = req.query;

    const query = { isActive: true };

    if (role) {
        query.role = role;
    }
    if (skills) {
        query.skills = { $in: skills.split(',') };
    }
    if (interests) {
        query.interests = { $in: interests.split(',') };
    }
    if (search) {
        query.$or = [
            { fullName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { bio: { $regex: search, $options: 'i' } },
        ];
    }

    const users = await User.find(query)
        .select('fullName email profilePhoto bio role skills interests status customStatus')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ points: -1, createdAt: -1 });

    const count = await User.countDocuments(query);

    res.json({
        users,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count,
    });
});

// @desc    Update user streak
// @route   POST /api/users/streak
// @access  Protected
const updateStreak = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActive = user.streak.lastActiveDate ? new Date(user.streak.lastActiveDate) : null;

    if (lastActive) {
        lastActive.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));

        if (daysDiff === 0) {
            // Already logged today
            return res.json(user.streak);
        } else if (daysDiff === 1) {
            // Consecutive day
            user.streak.current += 1;
        } else {
            // Streak broken
            user.streak.current = 1;
        }
    } else {
        // First time
        user.streak.current = 1;
    }

    user.streak.longest = Math.max(user.streak.longest, user.streak.current);
    user.streak.lastActiveDate = new Date();

    await user.save();
    res.json(user.streak);
});

// @desc    Award points to user
// @route   POST /api/users/points
// @access  Protected
const awardPoints = asyncHandler(async (req, res) => {
    const { points, reason } = req.body;

    const user = await User.findById(req.user._id);
    user.points += points;

    // Level up logic (every 100 points = 1 level)
    user.level = Math.floor(user.points / 100) + 1;

    await user.save();
    res.json({ points: user.points, level: user.level });
});

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
// @access  Protected
const getLeaderboard = asyncHandler(async (req, res) => {
    const { period = 'alltime', limit = 50 } = req.query;

    const users = await User.find({ isActive: true })
        .select('fullName profilePhoto points level streak badges')
        .sort({ points: -1 })
        .limit(parseInt(limit));

    res.json(users);
});

module.exports = {
    updateStatus,
    updatePreferences,
    updateProfile,
    getUserDirectory,
    updateStreak,
    awardPoints,
    getLeaderboard,
};
