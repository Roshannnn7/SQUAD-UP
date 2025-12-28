const express = require('express');
const router = express.Router();
const {
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    getCallHistory,
    getCall,
    getActiveCalls,
} = require('../controllers/videoCallController');
const { protect } = require('../middleware/auth');

// Protected routes
router.use(protect);

router.post('/initiate', initiateCall);
router.put('/:id/accept', acceptCall);
router.put('/:id/reject', rejectCall);
router.put('/:id/end', endCall);
router.get('/history', getCallHistory);
router.get('/active', getActiveCalls);
router.get('/:id', getCall);

module.exports = router;
