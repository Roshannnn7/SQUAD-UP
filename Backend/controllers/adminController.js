const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const MentorProfile = require('../models/MentorProfile');
const StudentProfile = require('../models/StudentProfile');
const Project = require('../models/Project');
const Booking = require('../models/Booking');

// @desc    Get platform statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getPlatformStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalMentors = await User.countDocuments({ role: 'mentor' });
    const verifiedMentors = await MentorProfile.countDocuments({ isVerified: true });
    const pendingMentors = await MentorProfile.countDocuments({ isVerified: false });

    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: 'in-progress' });

    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });

    // Monthly growth
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const usersThisMonth = await User.countDocuments({
        createdAt: { $gte: thisMonth }
    });

    const bookingsThisMonth = await Booking.countDocuments({
        createdAt: { $gte: thisMonth }
    });

    const revenueThisMonth = await Booking.aggregate([
        {
            $match: {
                status: 'completed',
                paymentStatus: 'paid',
                createdAt: { $gte: thisMonth }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$price' }
            }
        }
    ]);

    res.json({
        users: {
            total: totalUsers,
            students: totalStudents,
            mentors: totalMentors,
            verifiedMentors,
            pendingMentors,
            monthlyGrowth: usersThisMonth,
        },
        projects: {
            total: totalProjects,
            active: activeProjects,
        },
        bookings: {
            total: totalBookings,
            pending: pendingBookings,
            completed: completedBookings,
            monthly: bookingsThisMonth,
            monthlyRevenue: revenueThisMonth[0]?.total || 0,
        },
    });
});

// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const { role, search, page = 1, limit = 20 } = req.query;

    let query = {};

    if (role) {
        query.role = role;
    }

    if (search) {
        query.$or = [
            { fullName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
        ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    // Get profiles for each user
    const usersWithProfiles = await Promise.all(
        users.map(async (user) => {
            let profile = null;

            if (user.role === 'student') {
                profile = await StudentProfile.findOne({ user: user._id });
            } else if (user.role === 'mentor') {
                profile = await MentorProfile.findOne({ user: user._id });
            }

            return {
                ...user.toObject(),
                profile,
            };
        })
    );

    const total = await User.countDocuments(query);

    res.json({
        users: usersWithProfiles,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        total,
    });
});

// @desc    Verify mentor
// @route   PUT /api/admin/mentors/:id/verify
// @access  Private/Admin
const verifyMentor = asyncHandler(async (req, res) => {
    const { isVerified } = req.body;

    const mentorProfile = await MentorProfile.findOne({ user: req.params.id });

    if (!mentorProfile) {
        res.status(404);
        throw new Error('Mentor profile not found');
    }

    mentorProfile.isVerified = isVerified;
    await mentorProfile.save();

    res.json({
        message: `Mentor ${isVerified ? 'verified' : 'unverified'} successfully`,
        mentor: mentorProfile,
    });
});

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = asyncHandler(async (req, res) => {
    const { isActive } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.isActive = isActive;
    await user.save();

    res.json({
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        user,
    });
});

// @desc    Get all bookings for admin
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getAdminBookings = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;

    let query = {};

    if (status) {
        query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(query)
        .populate('student', 'fullName profilePhoto email')
        .populate('mentor', 'fullName profilePhoto email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.json({
        bookings,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        total,
    });
});

// @desc    Get all projects for admin
// @route   GET /api/admin/projects
// @access  Private/Admin
const getAdminProjects = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;

    let query = {};

    if (status) {
        query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const projects = await Project.find(query)
        .populate('creator', 'fullName profilePhoto')
        .populate('members.user', 'fullName profilePhoto')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Project.countDocuments(query);

    res.json({
        projects,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        total,
    });
});

// @desc    Delete user permanently (Admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Cannot delete admin users
    if (user.role === 'admin') {
        res.status(400);
        throw new Error('Cannot delete admin users');
    }

    const Message = require('../models/Message');
    const Notification = require('../models/Notification');
    const VideoCall = require('../models/VideoCall');
    const Availability = require('../models/Availability');
    const SquadActivityLog = require('../models/SquadActivityLog');
    const SquadRule = require('../models/SquadRule');
    const JoinRequest = require('../models/JoinRequest');
    const Report = require('../models/Report');

    // Remove user from all squads
    await Project.updateMany(
        { 'members.user': user._id },
        { $pull: { members: { user: user._id } } }
    );

    // Delete projects created by user
    const userProjects = await Project.find({ creator: user._id });
    for (const project of userProjects) {
        // Delete all related data for each project
        await Promise.all([
            Message.deleteMany({ project: project._id }),
            SquadRule.deleteMany({ project: project._id }),
            JoinRequest.deleteMany({ project: project._id }),
            SquadActivityLog.deleteMany({ project: project._id }),
        ]);
        await project.deleteOne();
    }

    // Delete or anonymize user's messages
    await Message.updateMany(
        { sender: user._id },
        {
            $set: {
                content: '[Message from deleted user]',
                sender: null,
            }
        }
    );

    // Delete all user-related data
    await Promise.all([
        MentorProfile.deleteOne({ user: user._id }),
        StudentProfile.deleteOne({ user: user._id }),
        Booking.deleteMany({ $or: [{ student: user._id }, { mentor: user._id }] }),
        Notification.deleteMany({ $or: [{ user: user._id }, { sender: user._id }] }),
        VideoCall.deleteMany({ $or: [{ caller: user._id }, { receiver: user._id }] }),
        Availability.deleteMany({ mentor: user._id }),
        JoinRequest.deleteMany({ user: user._id }),
        SquadActivityLog.deleteMany({ user: user._id }),
        SquadRule.deleteMany({ createdBy: user._id }),
        Report.deleteMany({ $or: [{ reportedBy: user._id }, { targetId: user._id }] }),
    ]);

    // Delete the user
    await user.deleteOne();

    // Note: Firebase session invalidation should be handled on the client side
    // or through Firebase Admin SDK if needed

    res.json({
        message: 'User and all related data deleted successfully',
        deletedUserId: req.params.id,
    });
});

module.exports = {
    getPlatformStats,
    getUsers,
    verifyMentor,
    updateUserStatus,
    getAdminBookings,
    getAdminProjects,
    deleteUser,
};
