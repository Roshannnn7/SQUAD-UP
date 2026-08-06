const asyncHandler = require('express-async-handler');
const Booking = require('../models/Booking');
const Availability = require('../models/Availability');
const MentorProfile = require('../models/MentorProfile');
const User = require('../models/User');
const Notification = require('../models/Notification');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @desc    Create booking request
// @route   POST /api/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
    const { mentorId, availabilityId, scheduledDate, mode, notes } = req.body;

    // Get mentor
    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'mentor') {
        res.status(404);
        throw new Error('Mentor not found');
    }

    // Get availability slot
    const availability = await Availability.findById(availabilityId);
    if (!availability) {
        res.status(404);
        throw new Error('Availability slot not found');
    }

    // Check if slot is available
    if (!availability.isAvailable) {
        res.status(400);
        throw new Error('Time slot is not available');
    }

    // Check if mentor owns this slot
    const mentorProfile = await MentorProfile.findOne({ user: mentorId });
    if (!mentorProfile.availability.includes(availabilityId)) {
        res.status(400);
        throw new Error('Invalid availability slot');
    }

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
        mentor: mentorId,
        availability: availabilityId,
        scheduledDate: new Date(scheduledDate),
        status: { $in: ['pending', 'accepted'] }
    });

    if (conflictingBooking) {
        res.status(400);
        throw new Error('Time slot already booked');
    }

    // Calculate duration and price
    const [startHour, startMinute] = availability.startTime.split(':').map(Number);
    const [endHour, endMinute] = availability.endTime.split(':').map(Number);

    const duration = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
    const hours = duration / 60;
    const price = hours * mentorProfile.sessionPrice;

    // Create booking
    const booking = await Booking.create({
        student: req.user._id,
        mentor: mentorId,
        availability: availabilityId,
        scheduledDate: new Date(scheduledDate),
        startTime: availability.startTime,
        endTime: availability.endTime,
        duration,
        mode,
        price,
        notes
    });

    // Create notification for mentor
    await Notification.create({
        user: mentorId,
        title: 'New Booking Request',
        message: `${req.user.fullName} requested a ${mode} session`,
        type: 'booking',
        relatedId: booking._id,
        actionUrl: `/mentor/bookings/${booking._id}`
    });

    res.status(201).json(booking);
});

// @desc    Get user bookings
// @route   GET /api/bookings
// @access  Private
const getBookings = asyncHandler(async (req, res) => {
    const { status, type } = req.query;

    let query = {};

    if (req.user.role === 'student') {
        query.student = req.user._id;
    } else if (req.user.role === 'mentor') {
        query.mentor = req.user._id;
    }

    if (status) {
        query.status = status;
    }

    if (type === 'upcoming') {
        query.scheduledDate = { $gte: new Date() };
    } else if (type === 'past') {
        query.scheduledDate = { $lt: new Date() };
    }

    const bookings = await Booking.find(query)
        .populate(
            req.user.role === 'student' ? 'mentor' : 'student',
            'fullName profilePhoto email'
        )
        .sort({ scheduledDate: 1 });

    res.json(bookings);
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id)
        .populate('student', 'fullName profilePhoto email')
        .populate('mentor', 'fullName profilePhoto email');

    if (!booking) {
        res.status(404);
        throw new Error('Booking not found');
    }

    // Check authorization
    if (
        booking.student._id.toString() !== req.user._id.toString() &&
        booking.mentor._id.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin'
    ) {
        res.status(401);
        throw new Error('Not authorized');
    }

    res.json(booking);
});

// @desc    Update booking status (accept/reject)
// @route   PUT /api/bookings/:id/status
// @access  Private/Mentor
const updateBookingStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        res.status(404);
        throw new Error('Booking not found');
    }

    // Check if user is the mentor
    if (booking.mentor.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
    }

    // Update status
    booking.status = status;

    // If rejected, make availability slot available again
    if (status === 'rejected') {
        await Availability.findByIdAndUpdate(booking.availability, {
            isAvailable: true
        });
    }

    // If accepted, mark slot as unavailable
    if (status === 'accepted') {
        await Availability.findByIdAndUpdate(booking.availability, {
            isAvailable: false
        });

        // Generate meeting link (in production, use actual video conferencing service)
        booking.meetingLink = `https://squadup.video/${booking._id}`;
    }

    await booking.save();

    // Create notification for student
    await Notification.create({
        user: booking.student,
        title: `Booking ${status}`,
        message: `Your session with ${req.user.fullName} has been ${status}`,
        type: 'booking',
        relatedId: booking._id,
        actionUrl: `/bookings/${booking._id}`
    });

    res.json(booking);
});

// @desc    Create Stripe payment intent
// @route   POST /api/bookings/:id/payment
// @access  Private
const createPaymentIntent = asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        res.status(404);
        throw new Error('Booking not found');
    }

    // Check if user is the student
    if (booking.student.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized');
    }

    // Check if booking is accepted
    if (booking.status !== 'accepted') {
        res.status(400);
        throw new Error('Booking must be accepted before payment');
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(booking.price * 100), // Convert to cents
        currency: 'usd',
        metadata: {
            bookingId: booking._id.toString(),
            studentId: req.user._id.toString(),
            mentorId: booking.mentor.toString()
        }
    });

    booking.stripePaymentId = paymentIntent.id;
    await booking.save();

    res.json({
        clientSecret: paymentIntent.client_secret
    });
});

// @desc    Complete booking (after session)
// @route   PUT /api/bookings/:id/complete
// @access  Private
const completeBooking = asyncHandler(async (req, res) => {
    const { rating, feedback } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        res.status(404);
        throw new Error('Booking not found');
    }

    // Check if user participated in the session
    if (
        booking.student.toString() !== req.user._id.toString() &&
        booking.mentor.toString() !== req.user._id.toString()
    ) {
        res.status(401);
        throw new Error('Not authorized');
    }

    // Update booking
    booking.status = 'completed';

    // If student is submitting, add rating and feedback
    if (booking.student.toString() === req.user._id.toString()) {
        booking.rating = rating;
        booking.feedback = feedback;

        // Update mentor's rating
        const mentorProfile = await MentorProfile.findOne({ user: booking.mentor });
        if (mentorProfile) {
            const totalRatings = mentorProfile.reviews.length;
            const newAverage = (mentorProfile.rating * totalRatings + rating) / (totalRatings + 1);
            mentorProfile.rating = parseFloat(newAverage.toFixed(1));

            mentorProfile.reviews.push({
                student: req.user._id,
                rating,
                comment: feedback,
                createdAt: new Date()
            });

            mentorProfile.totalSessions += 1;
            await mentorProfile.save();
        }
    }

    await booking.save();

    res.json(booking);
});

module.exports = {
    createBooking,
    getBookings,
    getBookingById,
    updateBookingStatus,
    createPaymentIntent,
    completeBooking,
};
