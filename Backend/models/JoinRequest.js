const mongoose = require('mongoose');

const joinRequestSchema = mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        reason: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        reviewedAt: {
            type: Date,
        },
        reviewNote: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
joinRequestSchema.index({ project: 1, status: 1 });
joinRequestSchema.index({ user: 1 });
joinRequestSchema.index({ createdAt: -1 });

// Compound unique index to prevent duplicate pending requests
joinRequestSchema.index(
    { project: 1, user: 1, status: 1 },
    {
        unique: true,
        partialFilterExpression: { status: 'pending' }
    }
);

const JoinRequest = mongoose.model('JoinRequest', joinRequestSchema);

module.exports = JoinRequest;
