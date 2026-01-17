const mongoose = require('mongoose');

const eventSchema = mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        creator: {
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
        startTime: {
            type: Date,
            required: true,
        },
        endTime: {
            type: Date,
            required: true,
        },
        location: {
            type: String,
            trim: true,
        },
        meetingLink: {
            type: String,
            trim: true,
        },
        attendees: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
            status: {
                type: String,
                enum: ['pending', 'accepted', 'declined'],
                default: 'pending',
            },
        }],
        reminderSent: {
            type: Boolean,
            default: false,
        },
        isRecurring: {
            type: Boolean,
            default: false,
        },
        recurrencePattern: {
            type: String,
            enum: ['daily', 'weekly', 'monthly'],
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
eventSchema.index({ project: 1 });
eventSchema.index({ creator: 1 });
eventSchema.index({ startTime: 1 });
eventSchema.index({ 'attendees.user': 1 });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
