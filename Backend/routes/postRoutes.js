const express = require('express');
const router = express.Router();
const {
    createPost,
    getFeedPosts,
    getUserPosts,
    getPost,
    updatePost,
    deletePost,
    togglePinPost,
    toggleLikePost,
    getPostLikes,
} = require('../controllers/postController');
const {
    createComment,
    getPostComments,
    getCommentReplies,
    updateComment,
    deleteComment,
} = require('../controllers/postCommentController');
const { protect, optionalAuth } = require('../middleware/auth');

// Post routes
router.post('/', protect, createPost);
router.get('/feed', protect, getFeedPosts);
router.get('/user/:userId', optionalAuth, getUserPosts);
router.get('/:postId', optionalAuth, getPost);
router.put('/:postId', protect, updatePost);
router.delete('/:postId', protect, deletePost);
router.put('/:postId/pin', protect, togglePinPost);

// Post interaction routes
router.post('/:postId/like', protect, toggleLikePost);
router.get('/:postId/likes', getPostLikes);

// Comment routes
router.post('/:postId/comments', protect, createComment);
router.get('/:postId/comments', getPostComments);

// Comment management routes
router.get('/comments/:commentId/replies', getCommentReplies);
router.put('/comments/:commentId', protect, updateComment);
router.delete('/comments/:commentId', protect, deleteComment);

module.exports = router;
