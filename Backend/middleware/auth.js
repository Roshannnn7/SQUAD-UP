const jwt          = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User         = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const firebaseAdmin = require('../config/firebase');
const logger       = require('../utils/logger');

/**
 * Helper to resolve user from token (JWT or Firebase ID Token)
 */
const resolveUserFromToken = async (token) => {
    if (!token) return null;

    const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
    let user = null;

    // 1. Try verifying as backend-issued JWT
    try {
        const decoded = jwt.verify(token, secret);
        if (decoded && decoded.id) {
            user = await User.findById(decoded.id).select('-password');
            if (user) return user;
        }
    } catch (jwtErr) {
        // If JWT verify fails, fall through to Firebase
    }

    // 2. Try verifying as Firebase ID token
    if (firebaseAdmin && firebaseAdmin.apps && firebaseAdmin.apps.length > 0) {
        try {
            const decodedFb = await firebaseAdmin.auth().verifyIdToken(token);
            if (decodedFb) {
                const query = [];
                if (decodedFb.uid) query.push({ firebaseUid: decodedFb.uid });
                if (decodedFb.email) query.push({ email: decodedFb.email });

                if (query.length > 0) {
                    user = await User.findOne({ $or: query }).select('-password');
                    if (user) {
                        // Ensure firebaseUid is linked if missing
                        if (decodedFb.uid && !user.firebaseUid) {
                            user.firebaseUid = decodedFb.uid;
                            await user.save();
                        }
                        return user;
                    }
                }
            }
        } catch (fbErr) {
            // Both JWT and Firebase verification failed
        }
    }

    return null;
};

/**
 * protect — Verifies Bearer access token (JWT or Firebase) and attaches req.user
 */
const protect = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401);
        throw new Error('Not authorized — no token');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        res.status(401);
        throw new Error('Not authorized — token missing');
    }

    const user = await resolveUserFromToken(token);

    if (!user) {
        res.status(401);
        throw new Error('Not authorized — token invalid or expired');
    }

    if (!user.isActive) {
        res.status(403);
        throw new Error('Account has been suspended');
    }

    req.user = user;
    next();
});

/**
 * optionalAuth — Attaches req.user if a valid token is present; otherwise continues
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return next();
    }

    try {
        const user = await resolveUserFromToken(token);
        if (user && user.isActive) {
            req.user = user;
        }
    } catch {
        // Silently continue — token errors are non-fatal for optional auth
    }

    next();
});

/**
 * admin — Requires req.user.role === 'admin'
 * Must be used AFTER protect
 */
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    res.status(403);
    throw new Error('Access denied — admin role required');
};

/**
 * mentor — Requires req.user.role === 'mentor' or 'admin'
 * Must be used AFTER protect
 */
const mentor = (req, res, next) => {
    if (req.user && (req.user.role === 'mentor' || req.user.role === 'admin')) {
        return next();
    }
    res.status(403);
    throw new Error('Access denied — mentor role required');
};

module.exports = { protect, optionalAuth, admin, mentor };
