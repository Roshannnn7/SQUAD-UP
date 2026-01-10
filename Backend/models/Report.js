const mongoose = require('mongoose');

const reportSchema = mongoose.Schema(
    {
        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        reportType: {
            type: String,
            enum: ['user', 'post', 'message', 'project'],
            required: true,
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'reportType',
        },
        reason: {
            type: String,
            enum: [
                'spam',
                'harassment',
                'inappropriate_content',
                'hate_speech',
                'violence',
                'misinformation',
                'copyright',
                'other',
            ],
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'reviewing', 'resolved', 'dismissed'],
            default: 'pending',
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        reviewedAt: {
            type: Date,
        },
        resolution: {
            type: String,
        },
        actionTaken: {
            type: String,
            enum: ['none', 'warning', 'content_removed', 'user_suspended', 'user_banned'],
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
reportSchema.index({ reportedBy: 1 });
reportSchema.index({ targetId: 1, reportType: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ createdAt: -1 });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
