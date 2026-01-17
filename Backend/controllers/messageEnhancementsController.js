const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');
const MessageReaction = require('../models/MessageReaction');
const MessageBookmark = require('../models/MessageBookmark');
const MessageThread = require('../models/MessageThread');
const User = require('../models/User');

// @desc    Add reaction to message
// @route   POST /api/messages/:id/react
// @access  Protected
const addReaction = asyncHandler(async (req, res) => {
    const { emoji } = req.body;
    const messageId = req.params.id;

    const message = await Message.findById(messageId);
    if (!message) {
        res.status(404);
        throw new Error('Message not found');
    }

    // Check if user already reacted with this emoji
    const existingReaction = await MessageReaction.findOne({
        message: messageId,
        user: req.user._id,
        emoji,
    });

    if (existingReaction) {
        // Remove reaction
        await existingReaction.deleteOne();
        return res.json({ message: 'Reaction removed' });
    }

    // Add new reaction
    const reaction = await MessageReaction.create({
        message: messageId,
        user: req.user._id,
        emoji,
    });

    res.status(201).json(reaction);
});

// @desc    Get reactions for a message
// @route   GET /api/messages/:id/reactions
// @access  Protected
const getReactions = asyncHandler(async (req, res) => {
    const reactions = await MessageReaction.find({ message: req.params.id })
        .populate('user', 'fullName profilePhoto')
        .sort({ createdAt: -1 });

    // Group by emoji
    const groupedReactions = reactions.reduce((acc, reaction) => {
        if (!acc[reaction.emoji]) {
            acc[reaction.emoji] = [];
        }
        acc[reaction.emoji].push(reaction);
        return acc;
    }, {});

    res.json(groupedReactions);
});

// @desc    Bookmark a message
// @route   POST /api/messages/:id/bookmark
// @access  Protected
const bookmarkMessage = asyncHandler(async (req, res) => {
    const { note } = req.body;
    const messageId = req.params.id;

    const message = await Message.findById(messageId);
    if (!message) {
        res.status(404);
        throw new Error('Message not found');
    }

    // Check if already bookmarked
    const existingBookmark = await MessageBookmark.findOne({
        user: req.user._id,
        message: messageId,
    });

    if (existingBookmark) {
        // Remove bookmark
        await existingBookmark.deleteOne();
        return res.json({ message: 'Bookmark removed' });
    }

    // Add bookmark
    const bookmark = await MessageBookmark.create({
        user: req.user._id,
        message: messageId,
        note: note || '',
    });

    res.status(201).json(bookmark);
});

// @desc    Get user's bookmarks
// @route   GET /api/messages/bookmarks
// @access  Protected
const getBookmarks = asyncHandler(async (req, res) => {
    const bookmarks = await MessageBookmark.find({ user: req.user._id })
        .populate({
            path: 'message',
            populate: {
                path: 'sender',
                select: 'fullName profilePhoto',
            },
        })
        .sort({ createdAt: -1 });

    res.json(bookmarks);
});

// @desc    Reply to a message (thread)
// @route   POST /api/messages/:id/reply
// @access  Protected
const replyToMessage = asyncHandler(async (req, res) => {
    const { content, messageType, fileUrl } = req.body;
    const parentMessageId = req.params.id;

    const parentMessage = await Message.findById(parentMessageId);
    if (!parentMessage) {
        res.status(404);
        throw new Error('Parent message not found');
    }

    // Create reply message
    const replyMessage = await Message.create({
        sender: req.user._id,
        project: parentMessage.project,
        receiver: parentMessage.receiver,
        content,
        messageType: messageType || 'text',
        fileUrl,
        threadParent: parentMessageId,
    });

    // Update parent message reply count
    parentMessage.threadReplyCount += 1;
    await parentMessage.save();

    // Create thread relationship
    await MessageThread.create({
        parentMessage: parentMessageId,
        replyMessage: replyMessage._id,
        project: parentMessage.project,
    });

    const populatedReply = await Message.findById(replyMessage._id)
        .populate('sender', 'fullName profilePhoto');

    res.status(201).json(populatedReply);
});

// @desc    Get thread replies for a message
// @route   GET /api/messages/:id/thread
// @access  Protected
const getThreadReplies = asyncHandler(async (req, res) => {
    const parentMessageId = req.params.id;

    const threads = await MessageThread.find({ parentMessage: parentMessageId })
        .populate({
            path: 'replyMessage',
            populate: {
                path: 'sender',
                select: 'fullName profilePhoto',
            },
        })
        .sort({ createdAt: 1 });

    const replies = threads.map(thread => thread.replyMessage);
    res.json(replies);
});

// @desc    Search messages by hashtag
// @route   GET /api/messages/hashtag/:tag
// @access  Protected
const searchByHashtag = asyncHandler(async (req, res) => {
    const { tag } = req.params;
    const { projectId } = req.query;

    const query = { hashtags: tag.toLowerCase() };
    if (projectId) {
        query.project = projectId;
    }

    const messages = await Message.find(query)
        .populate('sender', 'fullName profilePhoto')
        .sort({ createdAt: -1 })
        .limit(50);

    res.json(messages);
});

module.exports = {
    addReaction,
    getReactions,
    bookmarkMessage,
    getBookmarks,
    replyToMessage,
    getThreadReplies,
    searchByHashtag,
};
