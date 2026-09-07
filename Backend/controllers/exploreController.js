const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const Post = require('../models/Post');
const SkillChallenge = require('../models/SkillChallenge');
const User = require('../models/User');
const MentorProfile = require('../models/MentorProfile');
const MentorReview = require('../models/MentorReview');

// @desc    Get unified explore/trending data
// @route   GET /api/explore
// @access  Public
const getExplore = asyncHandler(async (req, res) => {
    const { category } = req.query;
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const [trendingSquads, topPosts, activeChalllenges, featuredMentors, trendingHashtags] = await Promise.all([
        // Trending squads: most members + recent activity
        Project.find({ isPublic: true, ...(category ? { category } : {}) })
            .select('name description category skillsRequired members views analytics hackathon')
            .populate('creator', 'fullName profilePhoto')
            .sort({ 'analytics.activityScore': -1, 'analytics.lastActivityAt': -1, views: -1 })
            .limit(8),

        // Top posts this week
        Post.find({ createdAt: { $gte: weekAgo }, isPublic: true })
            .select('content author likes images createdAt hashtags')
            .populate('author', 'fullName profilePhoto username')
            .sort({ 'likes': -1, createdAt: -1 })
            .limit(6),

        // Active challenges closest to deadline
        SkillChallenge.find({ status: 'active', deadline: { $gte: now } })
            .select('title description type difficulty xpReward deadline project creator tags')
            .populate('creator', 'fullName profilePhoto')
            .populate('project', 'name')
            .sort({ deadline: 1 })
            .limit(6),

        // Featured mentors with highest ratings
        MentorProfile.find({ isVerified: true, isAvailable: true })
            .select('user expertise sessionRate averageRating reviewCount')
            .populate('user', 'fullName profilePhoto headline')
            .sort({ averageRating: -1, reviewCount: -1 })
            .limit(6),

        // Trending hashtags from recent posts
        Post.aggregate([
            { $match: { createdAt: { $gte: weekAgo }, hashtags: { $exists: true, $ne: [] } } },
            { $unwind: '$hashtags' },
            { $group: { _id: '$hashtags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 15 },
        ]),
    ]);

    res.json({
        trendingSquads: trendingSquads.map(s => ({
            ...s.toObject(),
            memberCount: s.members?.length || 0,
        })),
        topPosts,
        activeChalllenges,
        featuredMentors,
        trendingHashtags: trendingHashtags.map(h => ({ tag: h._id, count: h.count })),
    });
});

// @desc    Get suggested users based on skill matching
// @route   GET /api/explore/suggested-users
// @access  Private
const getSuggestedUsers = asyncHandler(async (req, res) => {
    const currentUser = req.user;
    const mySkills = currentUser.skills || [];
    const myInterests = currentUser.interests || [];

    // Users whose skills match my interests, or whose interests match my skills
    const candidates = await User.find({
        _id: { $ne: currentUser._id },
        isActive: true,
        role: 'student',
        $or: [
            { skills: { $in: myInterests } },
            { interests: { $in: mySkills } },
            { skills: { $in: mySkills } }, // Similar skillset
        ],
    })
        .select('fullName profilePhoto bio skills interests headline status')
        .limit(20);

    // Score by overlap
    const scored = candidates.map(user => {
        const skillOverlap = (user.skills || []).filter(s =>
            myInterests.includes(s) || mySkills.includes(s)
        ).length;
        const interestOverlap = (user.interests || []).filter(i => mySkills.includes(i)).length;
        return { ...user.toObject(), matchScore: skillOverlap + interestOverlap };
    }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);

    res.json(scored);
});

// @desc    Get squad health score
// @route   GET /api/explore/squad-health/:id
// @access  Private (member)
const getSquadHealth = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id)
        .populate('members.user', 'fullName');

    if (!project) {
        res.status(404);
        throw new Error('Squad not found');
    }

    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    // Fetch supporting data for health calculation
    const [Task, StandUp, Event] = await Promise.all([
        require('../models/Task').find({ project: project._id }),
        require('../models/StandUp').find({ project: project._id, createdAt: { $gte: weekAgo } }),
        require('../models/Event').find({ project: project._id, startTime: { $gte: weekAgo } }),
    ]);

    const totalTasks = Task.length;
    const doneTasks = Task.filter(t => t.status === 'done').length;
    const taskCompletionRate = totalTasks > 0 ? doneTasks / totalTasks : 0;
    const weeklyMessages = project.analytics?.messageCount || 0;
    const memberCount = project.members?.length || 1;
    const standupFrequency = StandUp.length;
    const eventCount = Event.length;
    const activityScore = project.analytics?.activityScore || 0;

    // Weighted health score (0–100)
    const taskScore = Math.min(taskCompletionRate * 30, 30);        // max 30
    const messagingScore = Math.min((weeklyMessages / memberCount) * 2, 20); // max 20
    const standupScore = Math.min(standupFrequency * 5, 20);       // max 20
    const eventScore = Math.min(eventCount * 5, 15);               // max 15
    const memberScore = Math.min(memberCount * 1.5, 15);           // max 15

    const totalScore = Math.round(taskScore + messagingScore + standupScore + eventScore + memberScore);

    const breakdown = {
        taskCompletion: { score: Math.round(taskScore), max: 30, label: 'Task Completion', value: `${doneTasks}/${totalTasks} tasks done` },
        messaging: { score: Math.round(messagingScore), max: 20, label: 'Communication', value: `${weeklyMessages} messages/week` },
        standups: { score: Math.round(standupScore), max: 20, label: 'Daily Standups', value: `${standupFrequency} this week` },
        events: { score: Math.round(eventScore), max: 15, label: 'Events & Meetings', value: `${eventCount} this week` },
        members: { score: Math.round(memberScore), max: 15, label: 'Team Size', value: `${memberCount} members` },
    };

    let healthLabel = 'Critical';
    if (totalScore >= 80) healthLabel = 'Excellent';
    else if (totalScore >= 60) healthLabel = 'Good';
    else if (totalScore >= 40) healthLabel = 'Fair';
    else if (totalScore >= 20) healthLabel = 'Needs Attention';

    // Cache health score
    await Project.findByIdAndUpdate(project._id, {
        'healthScore.score': totalScore,
        'healthScore.computedAt': now,
    });

    res.json({ score: totalScore, label: healthLabel, breakdown });
});

// @desc    Get squad recommendations for user
// @route   GET /api/explore/recommended-squads
// @access  Private
const getRecommendedSquads = asyncHandler(async (req, res) => {
    const currentUser = req.user;
    const mySkills = (currentUser.skills || []).map(s => s.toLowerCase());
    const myInterests = (currentUser.interests || []).map(s => s.toLowerCase());

    // Get all squads the user is NOT in
    const allSquads = await Project.find({
        isPublic: true,
        status: { $ne: 'completed' },
        'members.user': { $ne: currentUser._id },
    })
        .select('name description category skillsRequired discoveryTags members views analytics hackathon')
        .populate('creator', 'fullName profilePhoto')
        .limit(50);

    // Score each squad by Jaccard similarity
    const scored = allSquads.map(squad => {
        const squadSkills = [
            ...(squad.skillsRequired || []),
            ...(squad.discoveryTags || []),
        ].map(s => s.toLowerCase());

        const intersection = squadSkills.filter(s => mySkills.includes(s) || myInterests.includes(s));
        const union = new Set([...squadSkills, ...mySkills, ...myInterests]);
        const jaccardScore = union.size > 0 ? intersection.length / union.size : 0;
        const matchedSkills = intersection.slice(0, 4); // top 4 matched skills to show user

        return {
            ...squad.toObject(),
            matchScore: Math.round(jaccardScore * 100),
            matchedSkills,
            memberCount: squad.members?.length || 0,
        };
    });

    // Sort by match score, break ties with activity
    scored.sort((a, b) => b.matchScore - a.matchScore || b.memberCount - a.memberCount);

    res.json(scored.slice(0, 12));
});

module.exports = { getExplore, getSuggestedUsers, getSquadHealth, getRecommendedSquads };
