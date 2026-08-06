const asyncHandler = require('express-async-handler');
const SkillChallenge = require('../models/SkillChallenge');
const ChallengeSubmission = require('../models/ChallengeSubmission');
const Project = require('../models/Project');
const { awardXPInternal } = require('./leaderboardController');

// @desc    Create a skill challenge in a squad
// @route   POST /api/challenges/:projectId
// @access  Private (admin/moderator)
const createChallenge = asyncHandler(async (req, res) => {
    const { title, description, type, difficulty, xpReward, deadline, tags } = req.body;
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Squad not found');
    }

    // Only admin/moderator can create challenges
    const isAuthorized = project.members.some(
        (m) =>
            m.user.toString() === req.user._id.toString() &&
            (m.role === 'admin' || m.role === 'moderator')
    );
    if (!isAuthorized && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Only squad admin/moderator can create challenges');
    }

    const challenge = await SkillChallenge.create({
        project: projectId,
        creator: req.user._id,
        title,
        description,
        type: type || 'coding',
        difficulty: difficulty || 'medium',
        xpReward: xpReward || 50,
        deadline: new Date(deadline),
        tags: tags || [],
    });

    await challenge.populate('creator', 'fullName profilePhoto');

    res.status(201).json(challenge);
});

// @desc    Get all challenges for a squad
// @route   GET /api/challenges/:projectId
// @access  Private (members only)
const getChallenges = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { status } = req.query;

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

    let query = { project: projectId };
    if (status) query.status = status;

    const challenges = await SkillChallenge.find(query)
        .populate('creator', 'fullName profilePhoto')
        .populate('winner', 'fullName profilePhoto')
        .sort({ createdAt: -1 });

    // For each challenge, get submission count and check if user submitted
    const enriched = await Promise.all(
        challenges.map(async (ch) => {
            const submissionCount = await ChallengeSubmission.countDocuments({ challenge: ch._id });
            const mySubmission = await ChallengeSubmission.findOne({
                challenge: ch._id,
                user: req.user._id,
            });
            return {
                ...ch.toObject(),
                submissionCount,
                hasSubmitted: !!mySubmission,
            };
        })
    );

    res.json(enriched);
});

// @desc    Submit to a challenge
// @route   POST /api/challenges/:challengeId/submit
// @access  Private
const submitToChallenge = asyncHandler(async (req, res) => {
    const { submissionUrl, description } = req.body;
    const { challengeId } = req.params;

    const challenge = await SkillChallenge.findById(challengeId);
    if (!challenge) {
        res.status(404);
        throw new Error('Challenge not found');
    }

    if (challenge.status !== 'active') {
        res.status(400);
        throw new Error('Challenge is no longer accepting submissions');
    }

    if (new Date() > challenge.deadline) {
        res.status(400);
        throw new Error('Challenge deadline has passed');
    }

    // Check if user is in the squad
    const project = await Project.findById(challenge.project);
    const isMember = project.members.some(
        (m) => m.user.toString() === req.user._id.toString()
    );
    if (!isMember) {
        res.status(403);
        throw new Error('Not a member of this squad');
    }

    const existing = await ChallengeSubmission.findOne({
        challenge: challengeId,
        user: req.user._id,
    });

    if (existing) {
        // Update existing submission
        existing.submissionUrl = submissionUrl;
        existing.description = description || '';
        await existing.save();
        await existing.populate('user', 'fullName profilePhoto');
        return res.json(existing);
    }

    const submission = await ChallengeSubmission.create({
        challenge: challengeId,
        user: req.user._id,
        submissionUrl,
        description: description || '',
    });

    await submission.populate('user', 'fullName profilePhoto');

    // Award XP for submitting (20 XP)
    await awardXPInternal(req.user._id, 20);

    res.status(201).json(submission);
});

// @desc    Vote on a submission
// @route   POST /api/challenges/submissions/:submissionId/vote
// @access  Private
const voteOnSubmission = asyncHandler(async (req, res) => {
    const { submissionId } = req.params;

    const submission = await ChallengeSubmission.findById(submissionId);
    if (!submission) {
        res.status(404);
        throw new Error('Submission not found');
    }

    const alreadyVoted = submission.votes.includes(req.user._id);

    if (alreadyVoted) {
        submission.votes = submission.votes.filter(
            (v) => v.toString() !== req.user._id.toString()
        );
    } else {
        submission.votes.push(req.user._id);
    }

    await submission.save();

    res.json({
        votes: submission.votes.length,
        hasVoted: !alreadyVoted,
    });
});

// @desc    Get submissions for a challenge
// @route   GET /api/challenges/:challengeId/submissions
// @access  Private
const getSubmissions = asyncHandler(async (req, res) => {
    const { challengeId } = req.params;

    const submissions = await ChallengeSubmission.find({ challenge: challengeId })
        .populate('user', 'fullName profilePhoto level badges')
        .sort({ createdAt: -1 });

    const mySubmission = submissions.find(
        (s) => s.user._id.toString() === req.user._id.toString()
    );

    res.json({ submissions, mySubmission: mySubmission || null });
});

// @desc    Declare winner and close challenge
// @route   PUT /api/challenges/:challengeId/winner/:submissionId
// @access  Private (admin/moderator)
const declareWinner = asyncHandler(async (req, res) => {
    const { challengeId, submissionId } = req.params;

    const challenge = await SkillChallenge.findById(challengeId);
    if (!challenge) {
        res.status(404);
        throw new Error('Challenge not found');
    }

    const project = await Project.findById(challenge.project);
    const isAuthorized = project.members.some(
        (m) =>
            m.user.toString() === req.user._id.toString() &&
            (m.role === 'admin' || m.role === 'moderator')
    );
    if (!isAuthorized) {
        res.status(403);
        throw new Error('Only admin/moderator can declare winner');
    }

    const submission = await ChallengeSubmission.findById(submissionId).populate('user');
    if (!submission) {
        res.status(404);
        throw new Error('Submission not found');
    }

    submission.isWinner = true;
    await submission.save();

    challenge.winner = submission.user._id;
    challenge.status = 'completed';
    await challenge.save();

    // Award XP to winner
    await awardXPInternal(submission.user._id, challenge.xpReward);

    res.json({
        message: `${submission.user.fullName} declared as winner! +${challenge.xpReward} XP awarded!`,
        challenge,
        winnerSubmission: submission,
    });
});

module.exports = {
    createChallenge,
    getChallenges,
    submitToChallenge,
    voteOnSubmission,
    getSubmissions,
    declareWinner,
};
