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
        // Privacy Settings
        privacy: {
            profileVisibility: {
                type: String,
                enum: ['public', 'connections', 'private'],
                default: 'public',
            },
            showEmail: {
                type: Boolean,
                default: false,
            },
            showSkills: {
                type: Boolean,
                default: true,
            },
            showProjects: {
                type: Boolean,
                default: true,
            },
            showConnections: {
                type: Boolean,
                default: true,
            },
            allowConnectionRequests: {
                type: Boolean,
                default: true,
            },
            allowMessages: {
                type: String,
                enum: ['everyone', 'connections', 'none'],
                default: 'everyone',
            },
        },
        // Profile Information
        headline: {
            type: String,
            maxlength: 120,
            default: '',
        },
        location: {
            city: String,
            state: String,
            country: String,
        },
        pronouns: {
            type: String,
            maxlength: 50,
            default: '',
        },
        // Connection Stats
        connectionCount: {
            type: Number,
            default: 0,
        },
        followerCount: {
            type: Number,
            default: 0,
        },
        followingCount: {
            type: Number,
            default: 0,
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
