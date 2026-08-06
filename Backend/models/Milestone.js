const mongoose = require('mongoose');

const milestoneSchema = mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: true,
            maxlength: 120,
        },
        description: {
            type: String,
            maxlength: 1000,
            default: '',
        },
        dueDate: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['upcoming', 'in-progress', 'completed', 'overdue'],
            default: 'upcoming',
        },
        order: {
            type: Number,
            default: 0,
        },
        color: {
            type: String,
            default: '#6366f1', // indigo
        },
        completedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

milestoneSchema.index({ project: 1, order: 1 });
milestoneSchema.index({ project: 1, dueDate: 1 });

const Milestone = mongoose.model('Milestone', milestoneSchema);

module.exports = Milestone;
