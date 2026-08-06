const mongoose = require('mongoose');

const postLikeSchema = mongoose.Schema(
    {
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        reactionType: {
            type: String,
            enum: ['like', 'love', 'insightful', 'celebrate', 'support'],
            default: 'like',
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
postLikeSchema.index({ post: 1, user: 1 }, { unique: true });
postLikeSchema.index({ user: 1 });
postLikeSchema.index({ createdAt: -1 });

const PostLike = mongoose.model('PostLike', postLikeSchema);

module.exports = PostLike;
