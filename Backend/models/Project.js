const mongoose = require('mongoose');

const projectSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        members: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            role: {
                type: String,
                enum: ['admin', 'moderator', 'member'],
                default: 'member',
            },
            joinedAt: {
                type: Date,
                default: Date.now,
            },
        }],
        pinnedMessages: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
        }],
        requireJoinApproval: {
            type: Boolean,
            default: false,
        },
        discoveryTags: [{
            type: String,
            trim: true,
        }],
        category: {
            type: String,
            enum: ['web', 'mobile', 'ai_ml', 'blockchain', 'game', 'iot', 'other'],
            default: 'other',
        },
        skillsRequired: [{
            type: String,
            trim: true,
        }],
        githubRepo: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['planning', 'in-progress', 'completed', 'on-hold'],
            default: 'planning',
        },
        progress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        isPublic: {
            type: Boolean,
            default: true,
        },
        maxMembers: {
            type: Number,
            default: 10,
        },
        chatRoomId: {
            type: String,
            unique: true,
        },
        // Showcase Features
        isShowcase: {
            type: Boolean,
            default: false,
        },
        showcaseDescription: {
            type: String,
        },
        showcaseImages: [{
            type: String,
        }],
        demoUrl: {
            type: String,
        },
        likes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
        views: {
            type: Number,
            default: 0,
        },
        // Analytics
        analytics: {
            messageCount: {
                type: Number,
                default: 0,
            },
            taskCompletionRate: {
                type: Number,
                default: 0,
            },
            activityScore: {
                type: Number,
                default: 0,
            },
            lastActivityAt: Date,
        },
        // Template
        createdFromTemplate: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SquadTemplate',
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
projectSchema.index({ creator: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ skillsRequired: 1 });
projectSchema.index({ isPublic: 1 });
projectSchema.index({ createdAt: -1 });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
