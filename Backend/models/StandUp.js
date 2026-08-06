const mongoose = require('mongoose');

const standUpSchema = mongoose.Schema(
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
        date: {
            type: String, // Format: YYYY-MM-DD
            required: true,
        },
        yesterday: {
            type: String,
            required: true,
            maxlength: 500,
        },
        today: {
            type: String,
            required: true,
            maxlength: 500,
        },
        blockers: {
            type: String,
            default: 'No blockers',
            maxlength: 500,
        },
        mood: {
            type: String,
            enum: ['great', 'good', 'okay', 'struggling'],
            default: 'good',
        },
    },
    {
        timestamps: true,
    }
);

// One stand-up per user per project per day
standUpSchema.index({ project: 1, user: 1, date: 1 }, { unique: true });

const StandUp = mongoose.model('StandUp', standUpSchema);

module.exports = StandUp;
