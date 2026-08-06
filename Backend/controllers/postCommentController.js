const PostComment = require('../models/PostComment');
const Post = require('../models/Post');
const Notification = require('../models/Notification');

// @desc    Create a comment on a post
// @route   POST /api/posts/:postId/comments
// @access  Private
const createComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content, parentComment, mentions } = req.body;
        const authorId = req.user._id;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: 'Comment content is required' });
        }

        const post = await Post.findById(postId).populate('author');
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = await PostComment.create({
            post: postId,
            author: authorId,
            content,
            parentComment: parentComment || null,
            mentions: mentions || [],
        });

        // Update post comment count
        post.commentCount += 1;
        await post.save();

        // Update parent comment reply count if this is a reply
        if (parentComment) {
            await PostComment.findByIdAndUpdate(parentComment, {
                $inc: { replyCount: 1 },
            });
        }

        // Create notification for post author (if not commenting on own post)
        if (post.author._id.toString() !== authorId.toString()) {
            await Notification.create({
                recipient: post.author._id,
                sender: authorId,
                type: 'post_comment',
                message: `${req.user.fullName} commented on your post`,
                relatedPost: postId,
            });
        }

        // Create notifications for mentions
        if (mentions && mentions.length > 0) {
            const notificationPromises = mentions
                .filter(mentionedUserId => mentionedUserId !== authorId.toString())
                .map(mentionedUserId =>
                    Notification.create({
                        recipient: mentionedUserId,
                        sender: authorId,
                        type: 'comment_mention',
                        message: `${req.user.fullName} mentioned you in a comment`,
                        relatedPost: postId,
                    })
                );
            await Promise.all(notificationPromises);
        }

        const populatedComment = await PostComment.findById(comment._id)
            .populate('author', 'fullName profilePhoto headline role')
            .populate('mentions', 'fullName profilePhoto');

        res.status(201).json({
            success: true,
            data: populatedComment,
            message: 'Comment added successfully',
        });
    } catch (error) {
        console.error('Create comment error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get comments for a post
// @route   GET /api/posts/:postId/comments
// @access  Public
const getPostComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const { page = 1, limit = 20, parentOnly = 'true' } = req.query;
        const skip = (page - 1) * limit;

        const query = { post: postId };

        // Only get top-level comments if parentOnly is true
        if (parentOnly === 'true') {
            query.parentComment = null;
        }

        const comments = await PostComment.find(query)
            .populate('author', 'fullName profilePhoto headline role')
            .populate('mentions', 'fullName profilePhoto')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await PostComment.countDocuments(query);

        res.status(200).json({
            success: true,
            data: comments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get post comments error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get replies to a comment
// @route   GET /api/comments/:commentId/replies
// @access  Public
const getCommentReplies = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const replies = await PostComment.find({ parentComment: commentId })
            .populate('author', 'fullName profilePhoto headline role')
            .populate('mentions', 'fullName profilePhoto')
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await PostComment.countDocuments({ parentComment: commentId });

        res.status(200).json({
            success: true,
            data: replies,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get comment replies error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update comment
// @route   PUT /api/comments/:commentId
// @access  Private
const updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const userId = req.user._id;

        const comment = await PostComment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.author.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: 'Comment content is required' });
        }

        comment.content = content;
        comment.isEdited = true;
        comment.editedAt = new Date();
        await comment.save();

        const updatedComment = await PostComment.findById(commentId)
            .populate('author', 'fullName profilePhoto headline role')
            .populate('mentions', 'fullName profilePhoto');

        res.status(200).json({
            success: true,
            data: updatedComment,
            message: 'Comment updated successfully',
        });
    } catch (error) {
        console.error('Update comment error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:commentId
// @access  Private
const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user._id;

        const comment = await PostComment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (comment.author.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Update post comment count
        await Post.findByIdAndUpdate(comment.post, {
            $inc: { commentCount: -1 },
        });

        // Update parent comment reply count if this is a reply
        if (comment.parentComment) {
            await PostComment.findByIdAndUpdate(comment.parentComment, {
                $inc: { replyCount: -1 },
            });
        }

        // Delete all replies to this comment
        const replies = await PostComment.find({ parentComment: commentId });
        if (replies.length > 0) {
            await PostComment.deleteMany({ parentComment: commentId });
            // Update post comment count for deleted replies
            await Post.findByIdAndUpdate(comment.post, {
                $inc: { commentCount: -replies.length },
            });
        }

        await comment.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Comment deleted successfully',
        });
    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createComment,
    getPostComments,
    getCommentReplies,
    updateComment,
    deleteComment,
};
