const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
    {
        actor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        action: {
            type: String,
            required: true,
            index: true,
        },
        target: {
            type: mongoose.Schema.Types.ObjectId,
            index: true,
        },
        targetType: {
            type: String,
        },
        details: {
            type: mongoose.Schema.Types.Mixed,
        },
        ip: {
            type: String,
            default: '',
        },
        userAgent: {
            type: String,
            default: '',
        },
        result: {
            type: String,
            enum: ['success', 'failure'],
            default: 'success',
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
        versionKey: false,
    }
);

// TTL index: auto-purge audit logs after 2 years
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2 * 365 * 24 * 3600 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
