const logger = require('../utils/logger');

/**
 * Central error handler
 * - Never exposes stack traces or request bodies in production
 * - Sets CORS headers only for whitelisted origins (no wildcard fallback)
 */
const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    // Log error safely — no request body (may contain passwords)
    logger.error('Unhandled error', {
        message:    err.message,
        method:     req.method,
        url:        req.originalUrl,
        statusCode,
        ip:         req.ip,
        stack:      process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    });

    // CORS: honour whitelisted origins only — NEVER fall back to '*'
    const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(o => o.trim());
    const requestOrigin   = req.headers.origin;
    if (requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin',      requestOrigin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Headers',     'Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Methods',     'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    }

    res.status(statusCode).json({
        success: false,
        message: err.message,
        // Stack only in non-production to aid development debugging
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
};

module.exports = errorHandler;
