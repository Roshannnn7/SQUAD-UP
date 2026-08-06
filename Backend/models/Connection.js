const mongoose = require('mongoose');

const connectionSchema = mongoose.Schema(
    {
        requester: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected', 'blocked'],
            default: 'pending',
        },
        message: {
            type: String,
            maxlength: 300,
            default: '',
        },
        respondedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
connectionSchema.index({ requester: 1, recipient: 1 });
connectionSchema.index({ status: 1 });
connectionSchema.index({ createdAt: -1 });

// Prevent duplicate connection requests
connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });

const Connection = mongoose.model('Connection', connectionSchema);

module.exports = Connection;
