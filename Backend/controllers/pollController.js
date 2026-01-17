const asyncHandler = require('express-async-handler');
const Poll = require('../models/Poll');
const Project = require('../models/Project');

// @desc    Create a poll
// @route   POST /api/polls
// @access  Protected
const createPoll = asyncHandler(async (req, res) => {
    const { projectId, question, options, allowMultipleVotes, isAnonymous, expiresAt } = req.body;

    // Verify user is a member of the project
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
        throw new Error('Not authorized to create polls in this squad');
    }

    // Create poll with options
    const pollOptions = options.map(opt => ({ text: opt, votes: [] }));

    const poll = await Poll.create({
        project: projectId,
        creator: req.user._id,
        question,
        options: pollOptions,
        allowMultipleVotes: allowMultipleVotes || false,
        isAnonymous: isAnonymous || false,
        expiresAt,
    });

    const populatedPoll = await Poll.findById(poll._id)
        .populate('creator', 'fullName profilePhoto');

    res.status(201).json(populatedPoll);
});

// @desc    Vote on a poll
// @route   POST /api/polls/:id/vote
// @access  Protected
const votePoll = asyncHandler(async (req, res) => {
    const { optionIndex } = req.body;
    const pollId = req.params.id;

    const poll = await Poll.findById(pollId);
    if (!poll) {
        res.status(404);
        throw new Error('Poll not found');
    }

    if (!poll.isActive) {
        res.status(400);
        throw new Error('Poll is no longer active');
    }

    if (poll.expiresAt && new Date() > poll.expiresAt) {
        poll.isActive = false;
        await poll.save();
        res.status(400);
        throw new Error('Poll has expired');
    }

    if (optionIndex < 0 || optionIndex >= poll.options.length) {
        res.status(400);
        throw new Error('Invalid option');
    }

    // Check if user already voted
    const hasVoted = poll.options.some(opt =>
        opt.votes.some(vote => vote.toString() === req.user._id.toString())
    );

    if (hasVoted && !poll.allowMultipleVotes) {
        // Remove previous vote if not allowing multiple votes
        poll.options.forEach(opt => {
            opt.votes = opt.votes.filter(vote => vote.toString() !== req.user._id.toString());
        });
    }

    // Check if already voted for this specific option
    const alreadyVotedForThisOption = poll.options[optionIndex].votes.some(
        vote => vote.toString() === req.user._id.toString()
    );

    if (alreadyVotedForThisOption) {
        // Remove vote
        poll.options[optionIndex].votes = poll.options[optionIndex].votes.filter(
            vote => vote.toString() !== req.user._id.toString()
        );
    } else {
        // Add vote
        poll.options[optionIndex].votes.push(req.user._id);
    }

    await poll.save();

    const populatedPoll = await Poll.findById(poll._id)
        .populate('creator', 'fullName profilePhoto')
        .populate(poll.isAnonymous ? '' : 'options.votes', 'fullName profilePhoto');

    res.json(populatedPoll);
});

// @desc    Get polls for a project
// @route   GET /api/polls/project/:projectId
// @access  Protected
const getProjectPolls = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const polls = await Poll.find({ project: projectId })
        .populate('creator', 'fullName profilePhoto')
        .sort({ createdAt: -1 });

    res.json(polls);
});

// @desc    Close a poll
// @route   PUT /api/polls/:id/close
// @access  Protected
const closePoll = asyncHandler(async (req, res) => {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
        res.status(404);
        throw new Error('Poll not found');
    }

    if (poll.creator.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to close this poll');
    }

    poll.isActive = false;
    await poll.save();

    res.json(poll);
});

// @desc    Delete a poll
// @route   DELETE /api/polls/:id
// @access  Protected
const deletePoll = asyncHandler(async (req, res) => {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
        res.status(404);
        throw new Error('Poll not found');
    }

    if (poll.creator.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to delete this poll');
    }

    await poll.deleteOne();
    res.json({ message: 'Poll deleted' });
});

module.exports = {
    createPoll,
    votePoll,
    getProjectPolls,
    closePoll,
    deletePoll,
};
