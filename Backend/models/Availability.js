const mongoose = require('mongoose');

const availabilitySchema = mongoose.Schema(
    {
        mentor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MentorProfile',
            required: true,
        },
        dayOfWeek: {
            type: Number,
            required: true,
            min: 0,
            max: 6,
        },
        startTime: {
            type: String,
            required: true,
        },
        endTime: {
            type: String,
            required: true,
        },
        isRecurring: {
            type: Boolean,
            default: true,
        },
        specificDate: {
            type: Date,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
availabilitySchema.index({ mentor: 1 });
availabilitySchema.index({ dayOfWeek: 1 });
availabilitySchema.index({ specificDate: 1 });
availabilitySchema.index({ isAvailable: 1 });

const Availability = mongoose.model('Availability', availabilitySchema);

module.exports = Availability;
