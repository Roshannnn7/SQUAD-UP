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

// @desc    Get user's conversations (unique chat partners)
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
    // Find all private messages where user is sender or receiver
    const messages = await Message.find({
        $or: [
            { sender: req.user._id },
            { receiver: req.user._id }
        ],
        project: { $exists: false } // Only private messages
    })
        .sort({ createdAt: -1 })
        .populate('sender', 'fullName profilePhoto')
        .populate('receiver', 'fullName profilePhoto');

    const conversationMap = new Map();

    messages.forEach(msg => {
        const otherUser = msg.sender._id.toString() === req.user._id.toString()
            ? msg.receiver
            : msg.sender;

        if (otherUser && !conversationMap.has(otherUser._id.toString())) {
            conversationMap.set(otherUser._id.toString(), {
                user: otherUser,
                lastMessage: msg.content,
                createdAt: msg.createdAt,
                unreadCount: 0
            });
        }
    });

    res.json(Array.from(conversationMap.values()));
});

// @desc    Send private message
// @route   POST /api/messages/private
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
    const { receiverId, content, messageType, fileUrl } = req.body;

    if (!receiverId || !content) {
        res.status(400);
        throw new Error('Please provide receiverId and content');
    }

    const message = await Message.create({
        sender: req.user._id,
        receiver: receiverId,
        content,
        messageType: messageType || 'text',
        fileUrl,
    });

    const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'fullName profilePhoto')
        .populate('receiver', 'fullName profilePhoto');

    res.status(201).json(populatedMessage);
});

module.exports = {
    getProjectMessages,
    getPrivateMessages,
    getConversations,
    sendMessage,
};
