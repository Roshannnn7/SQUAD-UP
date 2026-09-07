const asyncHandler = require('express-async-handler');
const MentorReview = require('../models/MentorReview');
const MentorProfile = require('../models/MentorProfile');
const Booking = require('../models/Booking');
const User = require('../models/User');

// @desc    Submit a review for a mentor (requires a completed booking)
// @route   POST /api/mentor-reviews/:mentorId
// @access  Private (student only)
const submitReview = asyncHandler(async (req, res) => {
    const { mentorId } = req.params;
    const { rating, review, bookingId } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        res.status(400);
        throw new Error('Rating must be between 1 and 5');
    }

    // Verify booking exists, is completed, and belongs to this student + mentor
    const booking = await Booking.findById(bookingId);
    if (!booking) {
        res.status(404);
        throw new Error('Booking not found');
    }
    if (booking.student.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('You can only review your own sessions');
    }
    if (booking.mentor.toString() !== mentorId) {
        res.status(400);
        throw new Error('Booking does not match this mentor');
    }
    if (booking.status !== 'completed') {
        res.status(400);
        throw new Error('You can only review completed sessions');
    }

    // Check if already reviewed
    const existing = await MentorReview.findOne({ booking: bookingId });
    if (existing) {
        res.status(400);
        throw new Error('You have already reviewed this session');
    }

    // Create review
    const newReview = await MentorReview.create({
        mentor: mentorId,
        student: req.user._id,
        booking: bookingId,
        rating,
        review: review || '',
    });

    // Update mentor profile average rating
    const allReviews = await MentorReview.find({ mentor: mentorId, isPublic: true });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await MentorProfile.findOneAndUpdate(
        { user: mentorId },
        { averageRating: Math.round(avgRating * 10) / 10, reviewCount: allReviews.length },
        { upsert: false }
    );

    await newReview.populate('student', 'fullName profilePhoto');

    res.status(201).json(newReview);
});

// @desc    Get reviews for a mentor
// @route   GET /api/mentor-reviews/:mentorId
// @access  Public
const getMentorReviews = asyncHandler(async (req, res) => {
    const { mentorId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await MentorReview.find({ mentor: mentorId, isPublic: true })
        .populate('student', 'fullName profilePhoto')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await MentorReview.countDocuments({ mentor: mentorId, isPublic: true });

    // Aggregate rating distribution
    const allRatings = await MentorReview.find({ mentor: mentorId, isPublic: true }, 'rating');
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    allRatings.forEach(r => { distribution[r.rating] = (distribution[r.rating] || 0) + 1; });
    const avgRating = total > 0
        ? Math.round((allRatings.reduce((s, r) => s + r.rating, 0) / total) * 10) / 10
        : 0;

    res.json({
        reviews,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        avgRating,
        distribution,
    });
});

// @desc    Check if user can review a specific mentor (completed booking exists, not yet reviewed)
// @route   GET /api/mentor-reviews/:mentorId/can-review
// @access  Private
const canReview = asyncHandler(async (req, res) => {
    const { mentorId } = req.params;

    // Find completed bookings for this student + mentor
    const completedBookings = await Booking.find({
        student: req.user._id,
        mentor: mentorId,
        status: 'completed',
    }).select('_id');

    if (completedBookings.length === 0) {
        return res.json({ canReview: false, reason: 'No completed sessions', bookingId: null });
    }

    // Check if already reviewed any of them
    const bookingIds = completedBookings.map(b => b._id);
    const existingReview = await MentorReview.findOne({
        student: req.user._id,
        mentor: mentorId,
        booking: { $in: bookingIds },
    });

    if (existingReview) {
        return res.json({ canReview: false, reason: 'Already reviewed', bookingId: null });
    }

    res.json({
        canReview: true,
        bookingId: completedBookings[0]._id,
    });
});

module.exports = { submitReview, getMentorReviews, canReview };
