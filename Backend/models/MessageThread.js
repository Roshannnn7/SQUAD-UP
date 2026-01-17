const mongoose = require('mongoose');

const messageThreadSchema = mongoose.Schema(
    {
        parentMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
            required: true,
        },
        replyMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
            required: true,
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
messageThreadSchema.index({ parentMessage: 1 });
messageThreadSchema.index({ replyMessage: 1 });
messageThreadSchema.index({ project: 1 });

const MessageThread = mongoose.model('MessageThread', messageThreadSchema);

module.exports = MessageThread;
