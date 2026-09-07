const express    = require('express');
const rateLimit  = require('express-rate-limit');
const router     = express.Router();

const {
    registerManual,
    verifyFirebaseToken,
    loginLocal,
    refreshAccessToken,
    logout,
    completeStudentProfile,
    completeMentorProfile,
    getMe,
    updateProfile,
    getUserProfile,
    forgotPassword,
    resetPassword,
    getSessions,
    revokeSession,
    revokeAllSessions,
    generateReferralCode,
    getReferralStats,
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');

// ─────────────────────────────────────────────
// Rate limiters
// ─────────────────────────────────────────────

/** Strict limiter for login / register — 10 attempts per 15 min per IP */
const strictAuthLimiter = rateLimit({
    windowMs:         15 * 60 * 1000,
    max:              10,
    standardHeaders:  true,
    legacyHeaders:    false,
    message:          { message: 'Too many attempts from this IP, please try again after 15 minutes.' },
    keyGenerator:     (req) => req.ip,
    skipSuccessfulRequests: false,
});

/** Lenient limiter for token refresh — 60 per 15 min (clients auto-call this) */
const refreshLimiter = rateLimit({
    windowMs:         15 * 60 * 1000,
    max:              60,
    standardHeaders:  true,
    legacyHeaders:    false,
    message:          { message: 'Too many refresh attempts, please try again later.' },
});

/** Forgot-password limiter — 5 per hour per IP (prevents OTP spam) */
const forgotPasswordLimiter = rateLimit({
    windowMs:         60 * 60 * 1000,
    max:              5,
    standardHeaders:  true,
    legacyHeaders:    false,
    message:          { message: 'Too many password reset requests, please try again in an hour.' },
});

// ─────────────────────────────────────────────
// Public routes (rate limited)
// ─────────────────────────────────────────────
router.post('/register',        strictAuthLimiter,      registerManual);
router.post('/verify',          strictAuthLimiter,      verifyFirebaseToken);
router.post('/login',           strictAuthLimiter,      loginLocal);
router.post('/refresh',        refreshLimiter,         refreshAccessToken);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password',  strictAuthLimiter,     resetPassword);

// ─────────────────────────────────────────────
// Protected routes
// ─────────────────────────────────────────────
router.post('/logout',                     protect, logout);
router.put('/complete-student-profile',    protect, completeStudentProfile);
router.put('/complete-mentor-profile',     protect, completeMentorProfile);
router.get('/me',                          protect, getMe);
router.put('/profile',                     protect, updateProfile);
router.get('/profile/:id',                 protect, getUserProfile);

// Session Management
router.get('/sessions',            protect, getSessions);
router.delete('/sessions',         protect, revokeAllSessions);
router.delete('/sessions/:tokenId', protect, revokeSession);

// Referral System
router.post('/referral/generate',  protect, generateReferralCode);
router.get('/referral/stats',      protect, getReferralStats);

module.exports = router;
