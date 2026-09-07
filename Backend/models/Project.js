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
                enum: ['admin', 'moderator', 'member', 'mentor'],
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
        // Shared Resources / Asset Hub
        resources: [{
            title: { type: String, required: true },
            url: { type: String, required: true },
            category: { 
                type: String, 
                enum: ['design', 'docs', 'database', 'code', 'other'],
                default: 'other'
            },
            addedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            addedAt: { type: Date, default: Date.now },
        }],
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
        // Open Roles
        openRoles: [{
            title: { type: String, required: true, maxlength: 100 },
            description: { type: String, maxlength: 500 },
            skills: [{ type: String, trim: true }],
            postedAt: { type: Date, default: Date.now },
            isOpen: { type: Boolean, default: true },
        }],
        // Hackathon Mode
        hackathon: {
            isHackathon: { type: Boolean, default: false },
            theme: { type: String, maxlength: 200, default: '' },
            startAt: { type: Date },
            endAt: { type: Date },
            submissionUrl: { type: String, default: '' },
            prizeDescription: { type: String, maxlength: 500, default: '' },
        },
        // Health Score (computed, cached)
        healthScore: {
            score: { type: Number, default: 0, min: 0, max: 100 },
            computedAt: { type: Date },
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
