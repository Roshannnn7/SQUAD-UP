const mongoose = require('mongoose');

const userExperienceSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: ['work', 'internship', 'volunteer', 'project', 'research'],
            required: true,
        },
        title: {
            type: String,
            required: true,
            maxlength: 200,
        },
        company: {
            type: String,
            maxlength: 200,
        },
        location: {
            type: String,
            maxlength: 200,
        },
        description: {
            type: String,
            maxlength: 2000,
        },
        skills: [{
            type: String,
            trim: true,
        }],
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
        },
        isCurrent: {
            type: Boolean,
            default: false,
        },
        mediaUrls: [{
            url: String,
            description: String,
        }],
    },
    {
        timestamps: true,
    }
);

// Indexes
userExperienceSchema.index({ user: 1, startDate: -1 });
userExperienceSchema.index({ type: 1 });

const UserExperience = mongoose.model('UserExperience', userExperienceSchema);

module.exports = UserExperience;
