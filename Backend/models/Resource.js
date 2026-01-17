const mongoose = require('mongoose');

const resourceSchema = mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        addedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        url: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['article', 'video', 'documentation', 'tutorial', 'tool', 'other'],
            default: 'other',
        },
        tags: [{
            type: String,
            trim: true,
        }],
        upvotes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
        downvotes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
    },
    {
        timestamps: true,
    }
);

// Indexes
resourceSchema.index({ project: 1 });
resourceSchema.index({ addedBy: 1 });
resourceSchema.index({ type: 1 });
resourceSchema.index({ tags: 1 });

const Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;
