const mongoose = require('mongoose');

const messageReactionSchema = mongoose.Schema(
    {
        message: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        emoji: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to ensure one reaction per user per message per emoji
messageReactionSchema.index({ message: 1, user: 1, emoji: 1 }, { unique: true });
messageReactionSchema.index({ message: 1 });

const MessageReaction = mongoose.model('MessageReaction', messageReactionSchema);

module.exports = MessageReaction;
