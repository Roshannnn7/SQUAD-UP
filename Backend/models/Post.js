const mongoose = require('mongoose');

const postSchema = mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: true,
            maxlength: 3000,
        },
        mediaUrls: [{
            url: String,
            type: {
                type: String,
                enum: ['image', 'video', 'document'],
                default: 'image',
            },
        }],
        postType: {
            type: String,
            enum: ['general', 'achievement', 'project', 'question', 'article'],
            default: 'general',
        },
        // For project posts
        relatedProject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
        },
        hashtags: [{
            type: String,
            trim: true,
            lowercase: true,
        }],
        mentions: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
        visibility: {
            type: String,
            enum: ['public', 'connections', 'private'],
            default: 'public',
        },
        isPinned: {
            type: Boolean,
            default: false,
        },
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
        commentCount: {
            type: Number,
            default: 0,
        },
        shareCount: {
            type: Number,
            default: 0,
        },
        viewCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ hashtags: 1 });
postSchema.index({ visibility: 1 });
postSchema.index({ postType: 1 });
postSchema.index({ createdAt: -1 });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
