const mongoose = require('mongoose');

const squadTemplateSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            enum: ['web', 'mobile', 'ai_ml', 'blockchain', 'game', 'iot', 'other'],
            required: true,
        },
        icon: {
            type: String,
            default: '🚀',
        },
        defaultRules: [{
            title: {
                type: String,
                required: true,
            },
            description: {
                type: String,
                required: true,
            },
        }],
        suggestedSkills: [{
            type: String,
            trim: true,
        }],
        defaultTags: [{
            type: String,
            trim: true,
        }],
        taskTemplate: [{
            title: {
                type: String,
                required: true,
            },
            description: String,
            status: {
                type: String,
                enum: ['todo', 'in-progress', 'done'],
                default: 'todo',
            },
        }],
        isOfficial: {
            type: Boolean,
            default: false,
        },
        usageCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
squadTemplateSchema.index({ category: 1 });
squadTemplateSchema.index({ isOfficial: 1 });
squadTemplateSchema.index({ usageCount: -1 });

const SquadTemplate = mongoose.model('SquadTemplate', squadTemplateSchema);

module.exports = SquadTemplate;
