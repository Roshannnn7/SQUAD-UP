const mongoose = require('mongoose');

const videoCallSchema = mongoose.Schema(
    {
        initiator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        callType: {
            type: String,
            enum: ['one-on-one', 'group'],
            default: 'one-on-one',
        },
        squad: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
        },
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
        },
        status: {
            type: String,
            enum: ['pending', 'active', 'ended', 'missed'],
            default: 'pending',
        },
        startTime: Date,
        endTime: Date,
        duration: Number, // in seconds
        participants: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                joinTime: Date,
                leaveTime: Date,
            },
        ],
        recordingUrl: String,
        notes: String,
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('VideoCall', videoCallSchema);
