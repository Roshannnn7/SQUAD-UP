const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const MentorProfile = require('../models/MentorProfile');
const firebaseAdmin = require('../config/firebase');

// Generate JWT Token (short-lived access token)
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

// Generate Refresh Token (long-lived)
const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET + '_refresh', {
        expiresIn: '90d',
    });
};

// @desc    Local login (for admin users with email/password)
// @route   POST /api/auth/login
// @access  Public
const loginLocal = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide email and password');
    }

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.password) {
        res.status(401);
        throw new Error('Invalid credentials');
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        res.status(401);
        throw new Error('Invalid credentials');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        profilePhoto: user.profilePhoto,
        isProfileComplete: user.isProfileComplete,
        token: accessToken,
        refreshToken,
    });
});

// @desc    Verify Firebase token and register/login user
// @route   POST /api/auth/verify
// @access  Public
const verifyFirebaseToken = asyncHandler(async (req, res) => {
    const { firebaseToken, role } = req.body;

    try {
        // Verify Firebase token
        const decodedToken = await firebaseAdmin.auth().verifyIdToken(firebaseToken);
        const { uid, email, name, picture } = decodedToken;

        // Check if user exists
        let user = await User.findOne({ firebaseUid: uid });

        if (user) {
            // Update last login
            user.lastLogin = new Date();
            await user.save();

            // Get user profile based on role
            let profile = null;
            if (user.role === 'student') {
                profile = await StudentProfile.findOne({ user: user._id });
            } else if (user.role === 'mentor') {
                profile = await MentorProfile.findOne({ user: user._id });
            }

            const accessToken = generateToken(user._id);
            const refreshToken = generateRefreshToken(user._id);

            res.json({
                _id: user._id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                profilePhoto: user.profilePhoto,
                isProfileComplete: user.isProfileComplete,
                profile,
                token: accessToken,
                refreshToken,
            });
        } else {
            // Create new user
            user = await User.create({
                firebaseUid: uid,
                email,
                fullName: name || email.split('@')[0],
                profilePhoto: picture || '',
                role: role || 'student',
            });

            const accessToken = generateToken(user._id);
            const refreshToken = generateRefreshToken(user._id);

            res.status(201).json({
                _id: user._id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                profilePhoto: user.profilePhoto,
                isProfileComplete: false,
                token: accessToken,
                refreshToken,
            });
        }
    } catch (error) {
        console.error('Firebase verification error:', error);
        res.status(401);
        throw new Error('Invalid Firebase token');
    }
});

// @desc    Complete student profile
// @route   PUT /api/auth/complete-student-profile
// @access  Private
const completeStudentProfile = asyncHandler(async (req, res) => {
    const {
        college,
        degree,
        year,
        semester,
        skills,
        interests,
        githubProfile,
        linkedinProfile,
        projectGoals,
        bio,
    } = req.body;

    // Basic server-side validation for required fields
    const missingFields = [];
    if (!college) missingFields.push('college');
    if (!degree) missingFields.push('degree');
    if (!year) missingFields.push('year');
    if (!semester) missingFields.push('semester');

    if (missingFields.length) {
        res.status(400);
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Check if profile already exists
    const existingProfile = await StudentProfile.findOne({ user: req.user._id });
    if (existingProfile) {
        res.status(400);
        throw new Error('Profile already completed');
    }

    // Create student profile
    const studentProfile = await StudentProfile.create({
        user: req.user._id,
        college,
        degree,
        year,
        semester: Number(semester) || 1,
        skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : []),
        interests: Array.isArray(interests) ? interests : (interests ? interests.split(',').map(i => i.trim()).filter(Boolean) : []),
        githubProfile: githubProfile || '',
        linkedinProfile,
        projectGoals,
        bio,
    });

    // Update user profile completion status
    await User.findByIdAndUpdate(req.user._id, {
        isProfileComplete: true,
        fullName: req.body.fullName || req.user.fullName,
        profilePhoto: req.body.profilePhoto || req.user.profilePhoto,
    });

    res.status(201).json({
        message: 'Student profile completed successfully',
        profile: studentProfile,
    });
});

// @desc    Complete mentor profile
// @route   PUT /api/auth/complete-mentor-profile
// @access  Private
const completeMentorProfile = asyncHandler(async (req, res) => {
    const {
        currentRole,
        company,
        experience,
        expertise,
        bio,
        sessionPrice,
        mode,
    } = req.body;

    // Check if profile already exists
    const existingProfile = await MentorProfile.findOne({ user: req.user._id });
    if (existingProfile) {
        res.status(400);
        throw new Error('Profile already completed');
    }

    // Create mentor profile
    const mentorProfile = await MentorProfile.create({
        user: req.user._id,
        currentRole,
        company,
        experience,
        expertise: Array.isArray(expertise) ? expertise : expertise.split(',').map(e => e.trim()),
        bio,
        sessionPrice,
        mode: Array.isArray(mode) ? mode : [mode],
    });

    // Update user role and profile completion status
    await User.findByIdAndUpdate(req.user._id, {
        role: 'mentor',
        isProfileComplete: true,
        fullName: req.body.fullName || req.user.fullName,
        profilePhoto: req.body.profilePhoto || req.user.profilePhoto,
    });

    res.status(201).json({
        message: 'Mentor profile completed successfully',
        profile: mentorProfile,
    });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');

    let profile = null;
    if (user.role === 'student') {
        profile = await StudentProfile.findOne({ user: user._id });
    } else if (user.role === 'mentor') {
        profile = await MentorProfile.findOne({ user: user._id }).populate('availability');
    }

    res.json({
        ...user.toObject(),
        profile,
    });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
    const { fullName, profilePhoto } = req.body;

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            fullName,
            profilePhoto,
        },
        { new: true }
    ).select('-password');

    res.json(user);
});

// @desc    Get user profile by ID
// @route   GET /api/auth/profile/:id
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    let profile = null;
    if (user.role === 'student') {
        profile = await StudentProfile.findOne({ user: user._id });
    } else if (user.role === 'mentor') {
        profile = await MentorProfile.findOne({ user: user._id });
    }

    res.json({
        ...user.toObject(),
        profile,
    });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshAccessToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        res.status(400);
        throw new Error('Refresh token is required');
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET + '_refresh');
        const user = await User.findById(decoded.id);

        if (!user) {
            res.status(401);
            throw new Error('User not found');
        }

        const newAccessToken = generateToken(user._id);

        res.json({
            token: newAccessToken,
        });
    } catch (error) {
        res.status(401);
        throw new Error('Invalid refresh token');
    }
});

module.exports = {
    verifyFirebaseToken,
    completeStudentProfile,
    completeMentorProfile,
    getMe,
    updateProfile,
    getUserProfile,
    refreshAccessToken,
    loginLocal,
};
