const mongoose = require('mongoose');

const studentProfileSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        college: {
            type: String,
            required: true,
        },
        degree: {
            type: String,
            required: true,
        },
        year: {
            type: String,
            required: true,
        },
        semester: {
            type: Number,
            required: true,
        },
        skills: [{
            type: String,
            trim: true,
        }],
        interests: [{
            type: String,
            trim: true,
        }],
        githubProfile: {
            type: String,
            default: '',
        },
        linkedinProfile: {
            type: String,
            default: '',
        },
        projectGoals: {
            type: String,
            default: '',
        },
        bio: {
            type: String,
            default: '',
        },
        projects: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
        }],
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
    },
    {
        timestamps: true,
    }
);

// Indexes
studentProfileSchema.index({ user: 1 });
studentProfileSchema.index({ skills: 1 });
studentProfileSchema.index({ college: 1 });

const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);

module.exports = StudentProfile;
