const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        mentor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        availability: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Availability',
            required: true,
        },
        scheduledDate: {
            type: Date,
            required: true,
        },
        startTime: {
            type: String,
            required: true,
        },
        endTime: {
            type: String,
            required: true,
        },
        duration: {
            type: Number,
            required: true,
        },
        mode: {
            type: String,
            enum: ['chat', 'video', 'screen-share'],
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
            default: 'pending',
        },
        price: {
            type: Number,
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'refunded'],
            default: 'pending',
        },
        stripePaymentId: {
            type: String,
        },
        meetingLink: {
            type: String,
        },
        notes: {
            type: String,
        },
        rating: {
            type: Number,
            min: 0,
            max: 5,
        },
        feedback: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
bookingSchema.index({ student: 1 });
bookingSchema.index({ mentor: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ scheduledDate: 1 });
bookingSchema.index({ 'scheduledDate': 1, 'startTime': 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
