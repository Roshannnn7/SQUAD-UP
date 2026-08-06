const mongoose = require('mongoose');

const squadRuleSchema = mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        order: {
            type: Number,
            default: 0,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
squadRuleSchema.index({ project: 1, order: 1 });
squadRuleSchema.index({ isActive: 1 });

const SquadRule = mongoose.model('SquadRule', squadRuleSchema);

module.exports = SquadRule;
