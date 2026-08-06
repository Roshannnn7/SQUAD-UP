const asyncHandler = require('express-async-handler');
const MentorProfile = require('../models/MentorProfile');
const Availability = require('../models/Availability');
const User = require('../models/User');
const Booking = require('../models/Booking');

// @desc    Get all mentors
// @route   GET /api/mentors
// @access  Public
const getMentors = asyncHandler(async (req, res) => {
    const { search, expertise, minRating, verified } = req.query;

    let query = {};

    // Search by name or company
    if (search) {
        const users = await User.find({
            fullName: { $regex: search, $options: 'i' },
            role: 'mentor'
        }).select('_id');
        query.user = { $in: users.map(u => u._id) };
    }

    // Filter by expertise
    if (expertise) {
        query.expertise = { $in: expertise.split(',') };
    }

    // Filter by minimum rating
    if (minRating) {
        query.rating = { $gte: parseFloat(minRating) };
    }

    // Filter by verification status
    if (verified !== undefined) {
        query.isVerified = verified === 'true';
    }

    const mentors = await MentorProfile.find(query)
        .populate('user', 'fullName profilePhoto email')
        .sort({ rating: -1 });

    res.json(mentors);
});

// @desc    Get single mentor
// @route   GET /api/mentors/:id
// @access  Public
const getMentorById = asyncHandler(async (req, res) => {
    const mentor = await MentorProfile.findOne({ user: req.params.id })
        .populate('user', 'fullName profilePhoto email')
        .populate('availability');

    if (!mentor) {
        res.status(404);
        throw new Error('Mentor not found');
    }

    // Get mentor's upcoming sessions
    const upcomingSessions = await Booking.find({
        mentor: mentor.user._id,
        status: 'accepted',
        scheduledDate: { $gte: new Date() }
    }).populate('student', 'fullName profilePhoto');

    res.json({
        ...mentor.toObject(),
        upcomingSessions
    });
});

// @desc    Get mentor availability
// @route   GET /api/mentors/:id/availability
// @access  Public
const getMentorAvailability = asyncHandler(async (req, res) => {
    const mentor = await MentorProfile.findOne({ user: req.params.id });

    if (!mentor) {
        res.status(404);
        throw new Error('Mentor not found');
    }

    const availability = await Availability.find({
        mentor: mentor._id,
        isAvailable: true
    });

    res.json(availability);
});

// @desc    Add availability slot
// @route   POST /api/mentors/availability
// @access  Private/Mentor
const addAvailability = asyncHandler(async (req, res) => {
    const { dayOfWeek, startTime, endTime, isRecurring, specificDate } = req.body;

    const mentorProfile = await MentorProfile.findOne({ user: req.user._id });

    if (!mentorProfile) {
        res.status(404);
        throw new Error('Mentor profile not found');
    }

    // Check for overlapping slots
    const overlappingSlot = await Availability.findOne({
        mentor: mentorProfile._id,
        dayOfWeek,
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
        isAvailable: true
    });

    if (overlappingSlot) {
        res.status(400);
        throw new Error('Overlapping time slot exists');
    }

    const availability = await Availability.create({
        mentor: mentorProfile._id,
        dayOfWeek,
        startTime,
        endTime,
        isRecurring,
        specificDate
    });

    // Add to mentor's availability array
    mentorProfile.availability.push(availability._id);
    await mentorProfile.save();

    res.status(201).json(availability);
});

// @desc    Update availability slot
// @route   PUT /api/mentors/availability/:id
// @access  Private/Mentor
const updateAvailability = asyncHandler(async (req, res) => {
    const availability = await Availability.findById(req.params.id);

    if (!availability) {
        res.status(404);
        throw new Error('Availability slot not found');
    }

    const mentorProfile = await MentorProfile.findOne({ user: req.user._id });

    if (!mentorProfile || !mentorProfile.availability.includes(availability._id)) {
        res.status(401);
        throw new Error('Not authorized to update this slot');
    }

    const updatedAvailability = await Availability.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    res.json(updatedAvailability);
});

// @desc    Delete availability slot
// @route   DELETE /api/mentors/availability/:id
// @access  Private/Mentor
const deleteAvailability = asyncHandler(async (req, res) => {
    const availability = await Availability.findById(req.params.id);

    if (!availability) {
        res.status(404);
        throw new Error('Availability slot not found');
    }

    const mentorProfile = await MentorProfile.findOne({ user: req.user._id });

    if (!mentorProfile || !mentorProfile.availability.includes(availability._id)) {
        res.status(401);
        throw new Error('Not authorized to delete this slot');
    }

    // Remove from mentor's availability array
    mentorProfile.availability = mentorProfile.availability.filter(
        slot => slot.toString() !== availability._id.toString()
    );
    await mentorProfile.save();

    await availability.deleteOne();

    res.json({ message: 'Availability slot removed' });
});

// @desc    Get mentor dashboard stats
// @route   GET /api/mentors/dashboard/stats
// @access  Private/Mentor
const getMentorStats = asyncHandler(async (req, res) => {
    const mentorProfile = await MentorProfile.findOne({ user: req.user._id });

    if (!mentorProfile) {
        return res.json({
            totalBookings: 0,
            pendingBookings: 0,
            upcomingBookings: 0,
            monthlyEarnings: 0,
            rating: 5,
            totalSessions: 0,
            recentBookings: []
        });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const totalBookings = await Booking.countDocuments({ mentor: req.user._id });
    const pendingBookings = await Booking.countDocuments({
        mentor: req.user._id,
        status: 'pending'
    });
    const upcomingBookings = await Booking.countDocuments({
        mentor: req.user._id,
        status: 'accepted',
        scheduledDate: { $gte: now }
    });
    const monthlyEarnings = await Booking.aggregate([
        {
            $match: {
                mentor: req.user._id,
                status: 'completed',
                paymentStatus: 'paid',
                scheduledDate: { $gte: startOfMonth, $lte: endOfMonth }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$price' }
            }
        }
    ]);

    const recentBookings = await Booking.find({ mentor: req.user._id })
        .populate('student', 'fullName profilePhoto')
        .sort({ createdAt: -1 })
        .limit(5);

    res.json({
        totalBookings,
        pendingBookings,
        upcomingBookings,
        monthlyEarnings: monthlyEarnings[0]?.total || 0,
        rating: mentorProfile.rating,
        totalSessions: mentorProfile.totalSessions,
        recentBookings
    });
});

// @desc    Get current mentor availability
// @route   GET /api/mentors/availability/me
// @access  Private/Mentor
const getMyAvailability = asyncHandler(async (req, res) => {
    const mentorProfile = await MentorProfile.findOne({ user: req.user._id });

    if (!mentorProfile) {
        return res.json([]);
    }

    const availability = await Availability.find({
        mentor: mentorProfile._id
    });

    res.json(availability);
});

module.exports = {
    getMentors,
    getMentorById,
    getMentorAvailability,
    addAvailability,
    updateAvailability,
    deleteAvailability,
    getMentorStats,
    getMyAvailability,
};
