const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');

// @desc    Get project message history
// @route   GET /api/messages/project/:projectId
// @access  Private
const getProjectMessages = asyncHandler(async (req, res) => {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await Message.find({ project: req.params.projectId })
        .populate('sender', 'fullName profilePhoto')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    res.json(messages.reverse());
});

// @desc    Get private message history
// @route   GET /api/messages/private/:userId
// @access  Private
const getPrivateMessages = asyncHandler(async (req, res) => {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await Message.find({
        $or: [
            { sender: req.user._id, receiver: req.params.userId },
            { sender: req.params.userId, receiver: req.user._id }
        ]
    })
        .populate('sender', 'fullName profilePhoto')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    res.json(messages.reverse());
});

module.exports = {
    getProjectMessages,
    getPrivateMessages,
};
