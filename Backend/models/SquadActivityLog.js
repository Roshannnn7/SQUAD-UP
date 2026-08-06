const mongoose = require('mongoose');

const squadActivityLogSchema = mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        action: {
            type: String,
            enum: [
                'member_joined',
                'member_left',
                'member_removed',
                'role_changed',
                'project_created',
                'project_updated',
                'project_deleted',
                'message_pinned',
                'message_unpinned',
                'rule_added',
                'rule_updated',
                'rule_deleted',
                'join_request_approved',
                'join_request_rejected',
            ],
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
squadActivityLogSchema.index({ project: 1, createdAt: -1 });
squadActivityLogSchema.index({ user: 1 });

const SquadActivityLog = mongoose.model('SquadActivityLog', squadActivityLogSchema);

module.exports = SquadActivityLog;
