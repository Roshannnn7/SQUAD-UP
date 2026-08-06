const mongoose = require('mongoose');

const mentorProfileSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        currentRole: {
            type: String,
            required: true,
        },
        company: {
            type: String,
            required: true,
        },
        experience: {
            type: Number,
            required: true,
            min: 0,
        },
        expertise: [{
            type: String,
            trim: true,
        }],
        bio: {
            type: String,
            required: true,
        },
        sessionPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        mode: [{
            type: String,
            enum: ['chat', 'video', 'screen-share'],
        }],
        isVerified: {
            type: Boolean,
            default: false,
        },
        totalSessions: {
            type: Number,
            default: 0,
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        reviews: [{
            student: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            rating: Number,
            comment: String,
            createdAt: Date,
        }],
        availability: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Availability',
        }],
    },
    {
        timestamps: true,
    }
);

// Indexes
mentorProfileSchema.index({ user: 1 });
mentorProfileSchema.index({ expertise: 1 });
mentorProfileSchema.index({ isVerified: 1 });
mentorProfileSchema.index({ rating: -1 });

const MentorProfile = mongoose.model('MentorProfile', mentorProfileSchema);

module.exports = MentorProfile;
