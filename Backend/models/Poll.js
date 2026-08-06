const mongoose = require('mongoose');

const pollSchema = mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        question: {
            type: String,
            required: true,
            trim: true,
        },
        options: [{
            text: {
                type: String,
                required: true,
                trim: true,
            },
            votes: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            }],
        }],
        allowMultipleVotes: {
            type: Boolean,
            default: false,
        },
        isAnonymous: {
            type: Boolean,
            default: false,
        },
        expiresAt: {
            type: Date,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
pollSchema.index({ project: 1 });
pollSchema.index({ creator: 1 });
pollSchema.index({ isActive: 1 });
pollSchema.index({ expiresAt: 1 });

const Poll = mongoose.model('Poll', pollSchema);

module.exports = Poll;
