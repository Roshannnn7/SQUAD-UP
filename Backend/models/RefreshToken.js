const mongoose = require('mongoose');

/**
 * RefreshToken model
 * - Stores server-side DB record for each issued refresh token
 * - Enables revocation, rotation, and "logout everywhere"
 * - Expired docs are auto-deleted by MongoDB TTL index
 */
const refreshTokenSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        isRevoked: {
            type: Boolean,
            default: false,
            index: true,
        },
        // Device / session context (for audit visibility)
        userAgent: {
            type: String,
            default: '',
        },
        ip: {
            type: String,
            default: '',
        },
        // Token that this one replaced (for rotation chain audit)
        replacedByToken: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Auto-delete documents once expiresAt has passed
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for fast "revoke all for user" queries
refreshTokenSchema.index({ user: 1, isRevoked: 1 });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
