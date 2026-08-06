const mongoose = require('mongoose');

const challengeSubmissionSchema = mongoose.Schema(
    {
        challenge: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SkillChallenge',
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        submissionUrl: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            maxlength: 1000,
            default: '',
        },
        votes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
        isWinner: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// One submission per user per challenge
challengeSubmissionSchema.index({ challenge: 1, user: 1 }, { unique: true });

const ChallengeSubmission = mongoose.model('ChallengeSubmission', challengeSubmissionSchema);

module.exports = ChallengeSubmission;
