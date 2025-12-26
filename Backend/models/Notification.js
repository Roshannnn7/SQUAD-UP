const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['booking', 'message', 'project', 'system', 'mentor'],
            required: true,
        },
        relatedId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        actionUrl: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
notificationSchema.index({ user: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
