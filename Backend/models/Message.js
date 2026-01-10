const mongoose = require('mongoose');

const messageSchema = mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
        },
        content: {
            type: String,
            required: true,
        },
        messageType: {
            type: String,
            enum: ['text', 'image', 'file', 'system'],
            default: 'text',
        },
        fileUrl: {
            type: String,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        readAt: {
            type: Date,
        },
        isPinned: {
            type: Boolean,
            default: false,
        },
        pinnedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        pinnedAt: {
            type: Date,
        },
        isEdited: {
            type: Boolean,
            default: false,
        },
        editedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ project: 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ isRead: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
