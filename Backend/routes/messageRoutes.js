const express = require('express');
const router = express.Router();
const { getProjectMessages, getPrivateMessages } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.get('/project/:projectId', protect, getProjectMessages);
router.get('/private/:userId', protect, getPrivateMessages);

module.exports = router;
