const mongoose = require('mongoose');

const skillChallengeSchema = mongoose.Schema(
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
        title: {
            type: String,
            required: true,
            maxlength: 120,
        },
        description: {
            type: String,
            required: true,
            maxlength: 2000,
        },
        type: {
            type: String,
            enum: ['coding', 'design', 'research', 'presentation', 'other'],
            default: 'coding',
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            default: 'medium',
        },
        xpReward: {
            type: Number,
            default: 50,
        },
        deadline: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['active', 'judging', 'completed'],
            default: 'active',
        },
        winner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        tags: [{ type: String, trim: true }],
    },
    {
        timestamps: true,
    }
);

skillChallengeSchema.index({ project: 1, status: 1 });
skillChallengeSchema.index({ deadline: 1 });

const SkillChallenge = mongoose.model('SkillChallenge', skillChallengeSchema);

module.exports = SkillChallenge;
