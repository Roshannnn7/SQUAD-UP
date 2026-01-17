const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        firebaseUid: {
            type: String,
            unique: true,
            sparse: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            select: false,
        },
        role: {
            type: String,
            enum: ['student', 'mentor', 'admin'],
            default: 'student',
        },
        fullName: {
            type: String,
            required: true,
        },
        profilePhoto: {
            type: String,
            default: '',
        },
        coverPhoto: {
            type: String,
            default: '',
        },
        bio: {
            type: String,
            maxlength: 500,
            default: '',
        },
        isProfileComplete: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastLogin: {
            type: Date,
            default: Date.now,
        },
        // Social Links
        socialLinks: {
            github: String,
            linkedin: String,
            twitter: String,
            portfolio: String,
        },
        // Skills & Interests
        skills: [{
            type: String,
            trim: true,
        }],
        interests: [{
            type: String,
            trim: true,
        }],
        // User Status & Availability
        status: {
            type: String,
            enum: ['online', 'offline', 'busy', 'away'],
            default: 'offline',
        },
        customStatus: {
            type: String,
            maxlength: 100,
            default: '',
        },
        doNotDisturb: {
            type: Boolean,
            default: false,
        },
        // Preferences
        preferences: {
            theme: {
                type: String,
                enum: ['light', 'dark', 'auto'],
                default: 'auto',
            },
            emailNotifications: {
                type: Boolean,
                default: true,
            },
            pushNotifications: {
                type: Boolean,
                default: true,
            },
        },
        // Gamification
        points: {
            type: Number,
            default: 0,
        },
        level: {
            type: Number,
            default: 1,
        },
        badges: [{
            name: String,
            icon: String,
            earnedAt: {
                type: Date,
                default: Date.now,
            },
        }],
        streak: {
            current: {
                type: Number,
                default: 0,
            },
            longest: {
                type: Number,
                default: 0,
            },
            lastActiveDate: Date,
        },
        // Verification
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        isGithubConnected: {
            type: Boolean,
            default: false,
        },
        isLinkedinConnected: {
            type: Boolean,
            default: false,
        },
        resetPasswordOtp: String,
        resetPasswordExpires: Date,
    },
    {
        timestamps: true,
    }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
