'use strict';

const asyncHandler = require('express-async-handler');
const jwt          = require('jsonwebtoken');
const bcrypt       = require('bcryptjs');
const crypto       = require('crypto');

const User            = require('../models/User');
const RefreshToken    = require('../models/RefreshToken');
const StudentProfile  = require('../models/StudentProfile');
const MentorProfile   = require('../models/MentorProfile');
const firebaseAdmin   = require('../config/firebase');
const sendEmail       = require('../utils/sendEmail');
const logger          = require('../utils/logger');

// ─────────────────────────────────────────────
// Token helpers
// ─────────────────────────────────────────────

/**
 * Issue a short-lived JWT access token.
 * Default: 15 minutes.  Override via ACCESS_TOKEN_EXPIRES_IN env var.
 */
const generateAccessToken = (id) => {
    const secret  = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
    const expires = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
    return jwt.sign({ id }, secret, { expiresIn: expires });
};

/**
 * Create a DB-backed opaque refresh token (crypto random, not JWT).
 * Stores the token hash in RefreshToken collection for revocation support.
 */
const createRefreshToken = async (userId, req) => {
    const expiryDays = parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || '30', 10);
    const expiresAt  = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

    // Opaque random token — 64 bytes of hex
    const rawToken = crypto.randomBytes(64).toString('hex');

    await RefreshToken.create({
        token:     rawToken,
        user:      userId,
        expiresAt,
        userAgent: req.headers['user-agent'] || '',
        ip:        req.ip || '',
    });

    return rawToken;
};

const sanitizePhotoUrl = (url, fallbackName = 'User') => {
    if (!url) return '';
    if (typeof url === 'string' && (url.includes('firebasestorage.googleapis.com') || url.includes('firebasestorage.app'))) {
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fallbackName)}`;
    }
    return url;
};

/**
 * Build the standard auth response payload (never includes password).
 */
const buildAuthResponse = (user, accessToken, refreshToken, extraFields = {}) => ({
    _id:               user._id,
    email:             user.email,
    fullName:          user.fullName,
    username:          user.username,
    role:              user.role,
    profilePhoto:      sanitizePhotoUrl(user.profilePhoto || user.avatarUrl, user.fullName),
    avatarUrl:         user.avatarUrl || '',
    college:           user.college || '',
    program:           user.program || '',
    bio:               user.bio || '',
    isProfileComplete: user.isProfileComplete,
    token:             accessToken,
    refreshToken,
    ...extraFields,
});

// ─────────────────────────────────────────────
// @desc    Manual email/password registration (name always from form)
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────
const registerManual = asyncHandler(async (req, res) => {
    const { fullName, email, role, firebaseUid } = req.body;

    if (!fullName || !email) {
        res.status(400);
        throw new Error('Full name and email are required');
    }

    // SECURITY: Never allow self-registration as admin
    const sanitizedRole = (role === 'mentor') ? 'mentor' : 'student';

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
        // Already registered — just return tokens (handles double-submit from Firebase)
        const accessToken  = generateAccessToken(existing._id);
        const refreshToken = await createRefreshToken(existing._id, req);
        return res.json({ user: buildAuthResponse(existing, accessToken, refreshToken), token: accessToken });
    }

    // Generate a unique username from the full name
    const baseUsername = fullName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    let username = baseUsername;
    let counter  = 1;
    while (await User.findOne({ username })) {
        username = `${baseUsername}${counter++}`;
    }

    const user = await User.create({
        fullName,           // ALWAYS the manually typed name — never Gmail
        email,
        role:         sanitizedRole,
        firebaseUid:  firebaseUid || undefined,
        username,
        profilePhoto: '',   // No photo on signup — chosen during onboarding
        avatarUrl:    '',
    });

    const accessToken  = generateAccessToken(user._id);
    const refreshToken = await createRefreshToken(user._id, req);

    logger.info('New user registered manually', { userId: user._id, role: user.role });

    res.status(201).json({ user: buildAuthResponse(user, accessToken, refreshToken), token: accessToken });
});

// ─────────────────────────────────────────────
// @desc    Local email/password login (admin or password-enabled users)
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────
const loginLocal = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide email and password');
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.password) {
        // Use a constant-time delay to resist timing attacks
        await bcrypt.compare('dummy', '$2b$10$invalidhashforconstanttimeXXXXXXXXXXXXXXXX');
        res.status(401);
        throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        logger.warn('Failed login attempt', { userId: user._id, ip: req.ip });
        res.status(401);
        throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
        res.status(403);
        throw new Error('Account has been suspended');
    }

    user.lastLogin = new Date();
    await user.save();

    const accessToken  = generateAccessToken(user._id);
    const refreshToken = await createRefreshToken(user._id, req);

    logger.info('User logged in', { userId: user._id, role: user.role });

    res.json(buildAuthResponse(user, accessToken, refreshToken));
});

// ─────────────────────────────────────────────
// @desc    Verify Firebase token and register/login user
// @route   POST /api/auth/verify
// @access  Public
// ─────────────────────────────────────────────
const verifyFirebaseToken = asyncHandler(async (req, res) => {
    const { firebaseToken, role } = req.body;

    if (!firebaseToken) {
        res.status(400);
        throw new Error('Firebase token is required');
    }

    let decodedToken;
    try {
        decodedToken = await firebaseAdmin.auth().verifyIdToken(firebaseToken);
    } catch (err) {
        logger.warn('Firebase token verification failed', { ip: req.ip, error: err.message });
        res.status(401);
        throw new Error('Invalid Firebase token');
    }

    const { uid, email, name, picture, firebase } = decodedToken;
    const signInProvider = firebase?.sign_in_provider || '';
    const isGoogleOAuth  = signInProvider === 'google.com';

    let user = await User.findOne({ $or: [{ firebaseUid: uid }, { email }] });

    if (user) {
        if (!user.isActive) {
            res.status(403);
            throw new Error('Account has been suspended');
        }

        // Only update name/photo from Google OAuth — never from email/password token
        if (isGoogleOAuth) {
            if (name && !user.fullName) user.fullName = name;
            if (picture && !user.profilePhoto) user.profilePhoto = picture;
        }
        if (!user.firebaseUid) user.firebaseUid = uid;
        user.lastLogin = new Date();
        await user.save();

        // Fetch role-specific profile
        let profile = null;
        if (user.role === 'student') {
            profile = await StudentProfile.findOne({ user: user._id });
        } else if (user.role === 'mentor') {
            profile = await MentorProfile.findOne({ user: user._id }).populate('availability');
            if (profile) {
                const profileObj = profile.toObject();
                profileObj.availability = (profileObj.availability || []).filter(
                    (slot) => slot != null && slot.startTime && slot.endTime
                );
                profile = profileObj;
            }
        }

        const accessToken  = generateAccessToken(user._id);
        const refreshToken = await createRefreshToken(user._id, req);

        logger.info('Firebase user logged in', { userId: user._id });

        return res.json(buildAuthResponse(user, accessToken, refreshToken, { profile }));
    }

    // Brand-new user via Google OAuth — use Gmail name and photo
    const baseUsername = (name || email.split('@')[0]).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    let username = baseUsername;
    let counter  = 1;
    while (await User.findOne({ username })) {
        username = `${baseUsername}${counter++}`;
    }

    // SECURITY: Never allow self-registration as admin via Firebase
    const sanitizedRole = (role === 'mentor') ? 'mentor' : 'student';

    user = await User.create({
        firebaseUid:  uid,
        email,
        // For Google OAuth: Gmail name is fine since user chose to sign in with Google
        fullName:     isGoogleOAuth ? (name || email.split('@')[0]) : email.split('@')[0],
        profilePhoto: isGoogleOAuth ? (picture || '') : '',
        role:         sanitizedRole,
        username,
    });

    const accessToken  = generateAccessToken(user._id);
    const refreshToken = await createRefreshToken(user._id, req);

    logger.info('New user registered via Firebase', { userId: user._id });

    return res.status(201).json(buildAuthResponse(user, accessToken, refreshToken));
});

// ─────────────────────────────────────────────
// @desc    Rotate refresh token → issue new access + refresh tokens
// @route   POST /api/auth/refresh
// @access  Public
// ─────────────────────────────────────────────
const refreshAccessToken = asyncHandler(async (req, res) => {
    // Accept token from body or HttpOnly cookie
    const rawToken = req.body.refreshToken || req.cookies?.refreshToken;

    if (!rawToken) {
        res.status(401);
        throw new Error('Refresh token required');
    }

    // Lookup in DB
    const stored = await RefreshToken.findOne({ token: rawToken });

    if (!stored) {
        res.status(401);
        throw new Error('Refresh token not found');
    }

    if (stored.isRevoked) {
        // Possible token reuse — revoke ALL tokens for this user (reuse detection)
        logger.warn('Refresh token reuse detected — revoking all sessions', {
            userId: stored.user,
            ip:     req.ip,
        });
        await RefreshToken.updateMany({ user: stored.user }, { isRevoked: true });
        res.status(401);
        throw new Error('Token reuse detected. All sessions have been revoked. Please login again.');
    }

    if (stored.expiresAt < new Date()) {
        res.status(401);
        throw new Error('Refresh token has expired');
    }

    const user = await User.findById(stored.user);
    if (!user || !user.isActive) {
        res.status(401);
        throw new Error('User not found or suspended');
    }

    // Rotate: revoke old token, issue new pair
    stored.isRevoked = true;
    await stored.save();

    const newAccessToken  = generateAccessToken(user._id);
    const newRefreshToken = await createRefreshToken(user._id, req);

    // Update rotation chain for audit
    await RefreshToken.updateOne({ token: newRefreshToken }, { replacedByToken: rawToken });

    logger.info('Tokens rotated', { userId: user._id });

    res.json({
        token:        newAccessToken,
        refreshToken: newRefreshToken,
    });
});

// ─────────────────────────────────────────────
// @desc    Logout — revoke current or all refresh tokens
// @route   POST /api/auth/logout
// @access  Private
// ─────────────────────────────────────────────
const logout = asyncHandler(async (req, res) => {
    const rawToken = req.body.refreshToken || req.cookies?.refreshToken;
    const logoutAll = req.body.logoutAll === true; // logout from every device

    if (logoutAll) {
        await RefreshToken.updateMany({ user: req.user._id }, { isRevoked: true });
        logger.info('User logged out from all sessions', { userId: req.user._id });
    } else if (rawToken) {
        await RefreshToken.updateOne({ token: rawToken }, { isRevoked: true });
        logger.info('User logged out from current session', { userId: req.user._id });
    }

    // Clear HttpOnly cookie if set
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure:   process.env.COOKIE_SECURE === 'true',
        sameSite: 'strict',
    });

    res.json({ message: 'Logged out successfully' });
});

// ─────────────────────────────────────────────
// @desc    Complete student profile
// @route   PUT /api/auth/complete-student-profile
// @access  Private
// ─────────────────────────────────────────────
const completeStudentProfile = asyncHandler(async (req, res) => {
    const {
        college, degree, year, semester,
        skills, interests, githubProfile,
        linkedinProfile, projectGoals, bio,
    } = req.body;

    const missingFields = [];
    if (!college)   missingFields.push('college');
    if (!degree)    missingFields.push('degree');
    if (!year)      missingFields.push('year');
    if (!semester)  missingFields.push('semester');

    if (missingFields.length) {
        res.status(400);
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const existingProfile = await StudentProfile.findOne({ user: req.user._id });
    if (existingProfile) {
        res.status(400);
        throw new Error('Profile already completed');
    }

    const skillsArr    = Array.isArray(skills)    ? skills    : (skills    ? skills.split(',').map(s => s.trim()).filter(Boolean)    : []);
    const interestsArr = Array.isArray(interests) ? interests : (interests ? interests.split(',').map(i => i.trim()).filter(Boolean) : []);

    const studentProfile = await StudentProfile.create({
        user:            req.user._id,
        college,
        degree,
        year,
        semester:        Number(semester) || 1,
        skills:          skillsArr,
        interests:       interestsArr,
        githubProfile:   githubProfile || '',
        linkedinProfile: linkedinProfile || '',
        projectGoals:    projectGoals || '',
        bio:             bio || '',
    });

    // Sync key fields back to User document for quick access (denormalization)
    const userUpdates = {
        isProfileComplete: true,
        bio:               bio || req.user.bio || '',
        college:           college || '',
        program:           degree ? (year ? `${degree} (Year ${year})` : degree) : '',
        skills:            skillsArr,
        interests:         interestsArr,
    };
    if (req.body.fullName)    userUpdates.fullName    = req.body.fullName;
    if (req.body.profilePhoto) userUpdates.profilePhoto = req.body.profilePhoto;
    if (req.body.avatarUrl)   userUpdates.avatarUrl   = req.body.avatarUrl;
    if (req.body.socialLinks) userUpdates.socialLinks = req.body.socialLinks;

    await User.findByIdAndUpdate(req.user._id, userUpdates);

    res.status(201).json({
        message: 'Student profile completed successfully',
        profile: studentProfile,
    });
});

// ─────────────────────────────────────────────
// @desc    Complete mentor profile
// @route   PUT /api/auth/complete-mentor-profile
// @access  Private
// ─────────────────────────────────────────────
const completeMentorProfile = asyncHandler(async (req, res) => {
    const { currentRole, company, experience, expertise, bio, sessionPrice, mode } = req.body;

    const existingProfile = await MentorProfile.findOne({ user: req.user._id });
    if (existingProfile) {
        res.status(400);
        throw new Error('Profile already completed');
    }

    const mentorProfile = await MentorProfile.create({
        user:         req.user._id,
        currentRole,
        company,
        experience,
        expertise:    Array.isArray(expertise) ? expertise : expertise.split(',').map(e => e.trim()),
        bio,
        sessionPrice,
        mode:         Array.isArray(mode) ? mode : [mode],
    });

    await User.findByIdAndUpdate(req.user._id, {
        role:              'mentor',
        isProfileComplete: true,
        fullName:    req.body.fullName    || req.user.fullName,
        profilePhoto: req.body.profilePhoto || req.user.profilePhoto,
    });

    res.status(201).json({
        message: 'Mentor profile completed successfully',
        profile: mentorProfile,
    });
});

// ─────────────────────────────────────────────
// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
// ─────────────────────────────────────────────
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    let profile = null;
    if (user.role === 'student') {
        profile = await StudentProfile.findOne({ user: user._id });
    } else if (user.role === 'mentor') {
        profile = await MentorProfile.findOne({ user: user._id }).populate('availability');
        // Filter out null/orphaned availability entries (same fix as getMentorById)
        if (profile) {
            const profileObj = profile.toObject();
            profileObj.availability = (profileObj.availability || []).filter(
                (slot) => slot != null && slot.startTime && slot.endTime
            );
            profile = profileObj;
        }
    }

    const userObj = user.toObject();
    userObj.profilePhoto = sanitizePhotoUrl(userObj.profilePhoto, userObj.fullName);

    res.json({ ...userObj, profile });
});

// ─────────────────────────────────────────────
// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
// ─────────────────────────────────────────────
const updateProfile = asyncHandler(async (req, res) => {
    const {
        fullName, profilePhoto, avatarUrl, bio,
        headline, college, program, username, socialLinks,
    } = req.body;

    const updates = {};
    if (fullName)    updates.fullName    = fullName;
    if (profilePhoto !== undefined) updates.profilePhoto = profilePhoto;
    if (avatarUrl !== undefined)   updates.avatarUrl   = avatarUrl;
    if (bio !== undefined)         updates.bio         = bio;
    if (headline !== undefined)    updates.headline    = headline;
    if (college !== undefined)     updates.college     = college;
    if (program !== undefined)     updates.program     = program;
    if (socialLinks)               updates.socialLinks = socialLinks;

    // Validate username uniqueness if changing
    if (username) {
        const taken = await User.findOne({ username, _id: { $ne: req.user._id } });
        if (taken) {
            res.status(400);
            throw new Error('Username is already taken');
        }
        updates.username = username.toLowerCase().trim();
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        updates,
        { new: true }
    ).select('-password');

    res.json(user);
});

// ─────────────────────────────────────────────
// @desc    Get user profile by ID
// @route   GET /api/auth/profile/:id
// @access  Private
// ─────────────────────────────────────────────
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

    res.json({ ...user.toObject(), profile });
});

// ─────────────────────────────────────────────
// @desc    Forgot Password — send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
// ─────────────────────────────────────────────
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    // Always respond 200 — prevents user enumeration
    const user = await User.findOne({ email });
    if (!user) {
        logger.info('Forgot-password requested for unknown email', { ip: req.ip });
        return res.json({ message: 'If that email exists, a reset OTP has been sent.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOtp     = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const message = `
        <div style="font-family:Arial,sans-serif;max-width:400px;margin:auto;padding:24px;border:1px solid #eee;border-radius:12px">
            <h2 style="color:#333">Password Reset</h2>
            <p>Use the code below to reset your Squad-Up password. It expires in 10 minutes.</p>
            <div style="background:#f4f4f4;padding:16px;text-align:center;font-size:28px;font-weight:bold;letter-spacing:8px;margin:20px 0;border-radius:8px">
                ${otp}
            </div>
            <p style="color:#999;font-size:12px">If you did not request this, you can safely ignore this email.</p>
        </div>
    `;

    try {
        await sendEmail({ email: user.email, subject: 'Squad-Up — Password Reset OTP', message });
    } catch (err) {
        logger.error('Failed to send password reset email', { userId: user._id, error: err.message });
        user.resetPasswordOtp     = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        res.status(500);
        throw new Error('Email could not be sent. Please try again later.');
    }

    res.json({ message: 'If that email exists, a reset OTP has been sent.' });
});

// ─────────────────────────────────────────────
// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
// ─────────────────────────────────────────────
const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        res.status(400);
        throw new Error('Email, OTP, and new password are required');
    }

    if (newPassword.length < 8) {
        res.status(400);
        throw new Error('Password must be at least 8 characters');
    }

    const user = await User.findOne({
        email,
        resetPasswordOtp:     otp,
        resetPasswordExpires: { $gt: Date.now() },
    }).select('+password');

    if (!user) {
        res.status(400);
        throw new Error('Invalid OTP or OTP has expired');
    }

    const salt = await bcrypt.genSalt(12);
    user.password             = await bcrypt.hash(newPassword, salt);
    user.resetPasswordOtp     = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Revoke all refresh tokens after password reset (security hygiene)
    await RefreshToken.updateMany({ user: user._id }, { isRevoked: true });

    logger.info('Password reset successful', { userId: user._id });

    res.json({ message: 'Password reset successful. Please log in with your new password.' });
});

module.exports = {
    registerManual,
    loginLocal,
    verifyFirebaseToken,
    refreshAccessToken,
    logout,
    completeStudentProfile,
    completeMentorProfile,
    getMe,
    updateProfile,
    getUserProfile,
    forgotPassword,
    resetPassword,
};
