const asyncHandler = require('express-async-handler');
const VideoCall = require('../models/VideoCall');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Project = require('../models/Project');

// @desc    Initiate a video call
// @route   POST /api/video-calls/initiate
// @access  Private
const initiateCall = asyncHandler(async (req, res) => {
    const { receiverId, callType, bookingId, squadId } = req.body;
    const initiatorId = req.user._id;

    // Validate inputs
    if (!receiverId && callType === 'one-on-one') {
        res.status(400);
        throw new Error('Receiver ID is required for one-on-one calls');
    }

    const videoCall = await VideoCall.create({
        initiator: initiatorId,
        receiver: receiverId || null,
        callType,
        booking: bookingId || null,
        squad: squadId || null,
        status: 'pending',
    });

    const populatedCall = await videoCall.populate('initiator receiver squad booking');

    res.status(201).json(populatedCall);
});

// @desc    Accept a video call
// @route   PUT /api/video-calls/:id/accept
// @access  Private
const acceptCall = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const videoCall = await VideoCall.findById(id);

    if (!videoCall) {
        res.status(404);
        throw new Error('Call not found');
    }

    if (videoCall.status !== 'pending') {
        res.status(400);
        throw new Error('Call is not pending');
    }

    // For one-on-one calls, check if user is the receiver
    if (videoCall.callType === 'one-on-one' && videoCall.receiver.toString() !== userId.toString()) {
        res.status(403);
        throw new Error('You are not authorized to accept this call');
    }

    videoCall.status = 'active';
    videoCall.startTime = new Date();
    videoCall.participants.push({
        userId: videoCall.initiator,
        joinTime: new Date(),
    });
    videoCall.participants.push({
        userId,
        joinTime: new Date(),
    });

    await videoCall.save();

    const populatedCall = await VideoCall.findById(id).populate('initiator receiver squad booking participants.userId');
    res.json(populatedCall);
});

// @desc    Reject/Cancel a video call
// @route   PUT /api/video-calls/:id/reject
// @access  Private
const rejectCall = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const videoCall = await VideoCall.findByIdAndUpdate(
        id,
        {
            status: 'missed',
            endTime: new Date(),
        },
        { new: true }
    ).populate('initiator receiver squad booking');

    res.json(videoCall);
});

// @desc    End a video call
// @route   PUT /api/video-calls/:id/end
// @access  Private
const endCall = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const videoCall = await VideoCall.findById(id);

    if (!videoCall) {
        res.status(404);
        throw new Error('Call not found');
    }

    videoCall.status = 'ended';
    videoCall.endTime = new Date();

    // Update participant leave time
    const participant = videoCall.participants.find(p => p.userId.toString() === userId.toString());
    if (participant) {
        participant.leaveTime = new Date();
    }

    // Calculate duration in seconds
    if (videoCall.startTime) {
        videoCall.duration = Math.floor((videoCall.endTime - videoCall.startTime) / 1000);
    }

    await videoCall.save();

    const populatedCall = await VideoCall.findById(id).populate('initiator receiver squad booking participants.userId');
    res.json(populatedCall);
});

// @desc    Get call history
// @route   GET /api/video-calls/history
// @access  Private
const getCallHistory = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { limit = 10, page = 1 } = req.query;

    const calls = await VideoCall.find({
        $or: [
            { initiator: userId },
            { receiver: userId },
            { 'participants.userId': userId },
        ],
    })
        .populate('initiator receiver squad booking')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await VideoCall.countDocuments({
        $or: [
            { initiator: userId },
            { receiver: userId },
            { 'participants.userId': userId },
        ],
    });

    res.json({
        calls,
        total,
        pages: Math.ceil(total / parseInt(limit)),
    });
});

// @desc    Get call by ID
// @route   GET /api/video-calls/:id
// @access  Private
const getCall = asyncHandler(async (req, res) => {
    const call = await VideoCall.findById(req.params.id).populate('initiator receiver squad booking participants.userId');

    if (!call) {
        res.status(404);
        throw new Error('Call not found');
    }

    res.json(call);
});

// @desc    Get active calls for user
// @route   GET /api/video-calls/active
// @access  Private
const getActiveCalls = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const activeCalls = await VideoCall.find({
        status: 'active',
        $or: [
            { initiator: userId },
            { receiver: userId },
            { 'participants.userId': userId },
        ],
    }).populate('initiator receiver squad booking participants.userId');

    res.json(activeCalls);
});

module.exports = {
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    getCallHistory,
    getCall,
    getActiveCalls,
};
