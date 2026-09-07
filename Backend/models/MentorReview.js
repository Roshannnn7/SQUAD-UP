const mongoose = require('mongoose');

const mentorReviewSchema = mongoose.Schema(
    {
        mentor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
            required: true,
            unique: true, // One review per booking
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        review: {
            type: String,
            maxlength: 1000,
            default: '',
        },
        isPublic: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

mentorReviewSchema.index({ mentor: 1, createdAt: -1 });
mentorReviewSchema.index({ student: 1 });
mentorReviewSchema.index({ booking: 1 });

const MentorReview = mongoose.model('MentorReview', mentorReviewSchema);

module.exports = MentorReview;
