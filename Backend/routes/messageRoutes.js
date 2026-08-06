const express = require('express');
const router = express.Router();
const { getProjectMessages, getPrivateMessages, getConversations, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.get('/conversations', protect, getConversations);
router.post('/private', protect, sendMessage);
router.get('/project/:projectId', protect, getProjectMessages);
router.get('/private/:userId', protect, getPrivateMessages);

module.exports = router;
