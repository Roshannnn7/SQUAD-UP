const jwt          = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User         = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const logger       = require('../utils/logger');

/**
 * protect — Verifies Bearer access token and attaches req.user
 */
const protect = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401);
        throw new Error('Not authorized — no token');
    }

    const token  = authHeader.split(' ')[1];
    const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;

    let decoded;
    try {
        decoded = jwt.verify(token, secret);
    } catch (err) {
        res.status(401);
        throw new Error('Not authorized — token invalid or expired');
    }

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
        res.status(401);
        throw new Error('Not authorized — user not found');
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

    const token  = authHeader.split(' ')[1];
    const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;

    try {
        const decoded = jwt.verify(token, secret);
        const user    = await User.findById(decoded.id).select('-password');
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
