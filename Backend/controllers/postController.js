const Post = require('../models/Post');
const PostLike = require('../models/PostLike');
const PostComment = require('../models/PostComment');
const PostShare = require('../models/PostShare');
const User = require('../models/User');
const Connection = require('../models/Connection');
const Notification = require('../models/Notification');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
    try {
        const { content, mediaUrls, postType, relatedProject, hashtags, mentions, visibility } = req.body;
        const authorId = req.user._id;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: 'Post content is required' });
        }

        const post = await Post.create({
            author: authorId,
            content,
            mediaUrls: mediaUrls || [],
            postType: postType || 'general',
            relatedProject,
            hashtags: hashtags || [],
            mentions: mentions || [],
            visibility: visibility || 'public',
        });

        // Create notifications for mentions
        if (mentions && mentions.length > 0) {
            const notificationPromises = mentions.map(mentionedUserId =>
                Notification.create({
                    recipient: mentionedUserId,
                    sender: authorId,
                    type: 'post_mention',
                    message: `${req.user.fullName} mentioned you in a post`,
                    relatedPost: post._id,
                })
            );
            await Promise.all(notificationPromises);
        }

        const populatedPost = await Post.findById(post._id)
            .populate('author', 'fullName profilePhoto headline role')
            .populate('relatedProject', 'name')
            .populate('mentions', 'fullName profilePhoto');

        res.status(201).json({
            success: true,
            data: populatedPost,
            message: 'Post created successfully',
        });
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get feed posts (posts from connections and public posts)
// @route   GET /api/posts/feed
// @access  Private
const getFeedPosts = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        // Get user's connections
        const connections = await Connection.find({
            $or: [
                { requester: userId, status: 'accepted' },
                { recipient: userId, status: 'accepted' },
            ],
        });

        const connectionIds = connections.map(conn => {
            return conn.requester.toString() === userId.toString()
                ? conn.recipient
                : conn.requester;
        });

        // Include user's own posts
        connectionIds.push(userId);

        // Get feed posts
        const posts = await Post.find({
            $or: [
                // Posts from connections
                { author: { $in: connectionIds }, visibility: { $in: ['public', 'connections'] } },
                // Public posts from everyone
                { visibility: 'public' },
            ],
        })
            .populate('author', 'fullName profilePhoto headline role')
            .populate('relatedProject', 'name description')
            .populate('mentions', 'fullName profilePhoto')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Post.countDocuments({
            $or: [
                { author: { $in: connectionIds }, visibility: { $in: ['public', 'connections'] } },
                { visibility: 'public' },
            ],
        });

        res.status(200).json({
            success: true,
            data: posts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get feed posts error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get user's posts
// @route   GET /api/posts/user/:userId
// @access  Public (with privacy checks)
const getUserPosts = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user?._id;
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        // Check if viewing own profile
        const isOwnProfile = currentUserId && currentUserId.toString() === userId;

        let visibilityFilter;
        if (isOwnProfile) {
            // Own profile - show all posts
            visibilityFilter = {};
        } else {
            // Check if users are connected
            const connection = currentUserId
                ? await Connection.findOne({
                    $or: [
                        { requester: currentUserId, recipient: userId, status: 'accepted' },
                        { requester: userId, recipient: currentUserId, status: 'accepted' },
                    ],
                })
                : null;

            if (connection) {
                // Connected - show public and connections posts
                visibilityFilter = { visibility: { $in: ['public', 'connections'] } };
            } else {
                // Not connected - show only public posts
                visibilityFilter = { visibility: 'public' };
            }
        }

        const posts = await Post.find({
            author: userId,
            ...visibilityFilter,
        })
            .populate('author', 'fullName profilePhoto headline role')
            .populate('relatedProject', 'name description')
            .populate('mentions', 'fullName profilePhoto')
            .sort({ isPinned: -1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Post.countDocuments({
            author: userId,
            ...visibilityFilter,
        });

        res.status(200).json({
            success: true,
            data: posts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get user posts error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get single post
// @route   GET /api/posts/:postId
// @access  Public (with privacy checks)
const getPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const currentUserId = req.user?._id;

        const post = await Post.findById(postId)
            .populate('author', 'fullName profilePhoto headline role')
            .populate('relatedProject', 'name description')
            .populate('mentions', 'fullName profilePhoto');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check visibility permissions
        const isAuthor = currentUserId && post.author._id.toString() === currentUserId.toString();

        if (!isAuthor && post.visibility !== 'public') {
            if (post.visibility === 'private') {
                return res.status(403).json({ message: 'This post is private' });
            }

            if (post.visibility === 'connections') {
                const connection = currentUserId
                    ? await Connection.findOne({
                        $or: [
                            { requester: currentUserId, recipient: post.author._id, status: 'accepted' },
                            { requester: post.author._id, recipient: currentUserId, status: 'accepted' },
                        ],
                    })
                    : null;

                if (!connection) {
                    return res.status(403).json({ message: 'This post is only visible to connections' });
                }
            }
        }

        // Increment view count
        post.viewCount += 1;
        await post.save();

        res.status(200).json({
            success: true,
            data: post,
        });
    } catch (error) {
        console.error('Get post error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update post
// @route   PUT /api/posts/:postId
// @access  Private
const updatePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content, mediaUrls, visibility, hashtags, postType } = req.body;
        const userId = req.user._id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if user is the author
        if (post.author.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Update fields
        if (content !== undefined) post.content = content;
        if (mediaUrls !== undefined) post.mediaUrls = mediaUrls;
        if (visibility !== undefined) post.visibility = visibility;
        if (hashtags !== undefined) post.hashtags = hashtags;
        if (postType !== undefined) post.postType = postType;

        post.isEdited = true;
        post.editedAt = new Date();

        await post.save();

        const updatedPost = await Post.findById(postId)
            .populate('author', 'fullName profilePhoto headline role')
            .populate('relatedProject', 'name description');

        res.status(200).json({
            success: true,
            data: updatedPost,
            message: 'Post updated successfully',
        });
    } catch (error) {
        console.error('Update post error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete post
// @route   DELETE /api/posts/:postId
// @access  Private
const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if user is the author
        if (post.author.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Delete associated likes, comments, and shares
        await Promise.all([
            PostLike.deleteMany({ post: postId }),
            PostComment.deleteMany({ post: postId }),
            PostShare.deleteMany({ originalPost: postId }),
            post.deleteOne(),
        ]);

        res.status(200).json({
            success: true,
            message: 'Post deleted successfully',
        });
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Toggle pin post
// @route   PUT /api/posts/:postId/pin
// @access  Private
const togglePinPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.author.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        post.isPinned = !post.isPinned;
        await post.save();

        res.status(200).json({
            success: true,
            data: post,
            message: post.isPinned ? 'Post pinned' : 'Post unpinned',
        });
    } catch (error) {
        console.error('Toggle pin post error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Like/Unlike a post
// @route   POST /api/posts/:postId/like
// @access  Private
const toggleLikePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { reactionType = 'like' } = req.body;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if already liked
        const existingLike = await PostLike.findOne({ post: postId, user: userId });

        if (existingLike) {
            // Unlike
            await existingLike.deleteOne();
            post.likeCount = Math.max(0, post.likeCount - 1);
            await post.save();

            return res.status(200).json({
                success: true,
                data: { liked: false },
                message: 'Post unliked',
            });
        } else {
            // Like
            await PostLike.create({
                post: postId,
                user: userId,
                reactionType,
            });

            post.likeCount += 1;
            await post.save();

            // Create notification if not own post
            if (post.author.toString() !== userId.toString()) {
                await Notification.create({
                    recipient: post.author,
                    sender: userId,
                    type: 'post_like',
                    message: `${req.user.fullName} liked your post`,
                    relatedPost: postId,
                });
            }

            return res.status(200).json({
                success: true,
                data: { liked: true, reactionType },
                message: 'Post liked',
            });
        }
    } catch (error) {
        console.error('Toggle like post error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get post likes
// @route   GET /api/posts/:postId/likes
// @access  Public
const getPostLikes = async (req, res) => {
    try {
        const { postId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const likes = await PostLike.find({ post: postId })
            .populate('user', 'fullName profilePhoto headline')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await PostLike.countDocuments({ post: postId });

        res.status(200).json({
            success: true,
            data: likes,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get post likes error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createPost,
    getFeedPosts,
    getUserPosts,
    getPost,
    updatePost,
    deletePost,
    togglePinPost,
    toggleLikePost,
    getPostLikes,
};
