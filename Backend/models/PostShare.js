const mongoose = require('mongoose');

const postShareSchema = mongoose.Schema(
    {
        originalPost: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            required: true,
        },
        sharedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        shareNote: {
            type: String,
            maxlength: 500,
            default: '',
        },
        visibility: {
            type: String,
            enum: ['public', 'connections', 'private'],
            default: 'public',
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
postShareSchema.index({ originalPost: 1 });
postShareSchema.index({ sharedBy: 1, createdAt: -1 });

const PostShare = mongoose.model('PostShare', postShareSchema);

module.exports = PostShare;
