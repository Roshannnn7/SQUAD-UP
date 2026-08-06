const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    addReaction,
    getReactions,
    bookmarkMessage,
    getBookmarks,
    replyToMessage,
    getThreadReplies,
    searchByHashtag,
} = require('../controllers/messageEnhancementsController');

router.post('/:id/react', protect, addReaction);
router.get('/:id/reactions', protect, getReactions);
router.post('/:id/bookmark', protect, bookmarkMessage);
router.get('/bookmarks', protect, getBookmarks);
router.post('/:id/reply', protect, replyToMessage);
router.get('/:id/thread', protect, getThreadReplies);
router.get('/hashtag/:tag', protect, searchByHashtag);

module.exports = router;
