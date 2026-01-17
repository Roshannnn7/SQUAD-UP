const mongoose = require('mongoose');

const messageBookmarkSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        message: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
            required: true,
        },
        note: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to ensure one bookmark per user per message
messageBookmarkSchema.index({ user: 1, message: 1 }, { unique: true });
messageBookmarkSchema.index({ user: 1 });

const MessageBookmark = mongoose.model('MessageBookmark', messageBookmarkSchema);

module.exports = MessageBookmark;
