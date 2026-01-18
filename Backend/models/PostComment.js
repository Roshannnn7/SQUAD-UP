const mongoose = require('mongoose');

const postCommentSchema = mongoose.Schema(
    {
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            required: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: true,
            maxlength: 1000,
        },
        // For nested comments/replies
        parentComment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PostComment',
        },
        mentions: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
        isEdited: {
            type: Boolean,
            default: false,
        },
        editedAt: {
            type: Date,
        },
        likeCount: {
            type: Number,
            default: 0,
        },
        replyCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
postCommentSchema.index({ post: 1, createdAt: -1 });
postCommentSchema.index({ author: 1 });
postCommentSchema.index({ parentComment: 1 });

const PostComment = mongoose.model('PostComment', postCommentSchema);

module.exports = PostComment;
