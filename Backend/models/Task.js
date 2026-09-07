const mongoose = require('mongoose');

const taskSchema = mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
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
        status: {
            type: String,
            enum: ['todo', 'in-progress', 'done'],
            default: 'todo',
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
        },
        assignedTo: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        dueDate: {
            type: Date,
        },
        order: {
            type: Number,
            default: 0,
        },
        labels: [{
            type: String,
            trim: true,
        }],
        // Sprint Planning
        sprint: {
            sprintNumber: { type: Number, default: 0 },
            name: { type: String, maxlength: 80 },
            startDate: { type: Date },
            endDate: { type: Date },
            goal: { type: String, maxlength: 300 },
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ dueDate: 1 });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
