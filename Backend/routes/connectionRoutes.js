const express = require('express');
const router = express.Router();
const {
    sendConnectionRequest,
    acceptConnectionRequest,
    rejectConnectionRequest,
    getUserConnections,
    getPendingRequests,
    removeConnection,
    getConnectionStatus,
} = require('../controllers/connectionController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Connection management routes
router.post('/request', sendConnectionRequest);
router.put('/accept/:connectionId', acceptConnectionRequest);
router.put('/reject/:connectionId', rejectConnectionRequest);
router.get('/pending', getPendingRequests);
router.get('/status/:userId', getConnectionStatus);
router.get('/', getUserConnections);
router.delete('/:connectionId', removeConnection);

module.exports = router;
