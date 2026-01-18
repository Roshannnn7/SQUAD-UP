const mongoose = require('mongoose');

const userEducationSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        school: {
            type: String,
            required: true,
            maxlength: 200,
        },
        degree: {
            type: String,
            required: true,
            maxlength: 200,
        },
        field: {
            type: String,
            maxlength: 200,
        },
        grade: {
            type: String,
            maxlength: 50,
        },
        description: {
            type: String,
            maxlength: 1000,
        },
        activities: {
            type: String,
            maxlength: 1000,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
        },
        isCurrent: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
userEducationSchema.index({ user: 1, startDate: -1 });

const UserEducation = mongoose.model('UserEducation', userEducationSchema);

module.exports = UserEducation;
