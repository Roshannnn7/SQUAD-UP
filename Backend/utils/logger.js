/**
 * logger.js — Structured logger utility
 *
 * In development: pretty-prints to stdout
 * In production:  JSON-structured logs suitable for Render / Papertrail / Datadog
 *
 * NEVER log: passwords, tokens, request bodies containing credentials
 */

const isProd = process.env.NODE_ENV === 'production';

const levels = {
    debug: 0,
    info:  1,
    warn:  2,
    error: 3,
};

const currentLevel = isProd ? levels.info : levels.debug;

const format = (level, message, meta) => {
    const entry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        ...(meta && Object.keys(meta).length > 0 ? { meta } : {}),
    };
    return isProd ? JSON.stringify(entry) : `[${entry.timestamp}] [${level.toUpperCase()}] ${message}${meta ? ' ' + JSON.stringify(meta) : ''}`;
};

const logger = {
    debug: (message, meta = {}) => {
        if (currentLevel <= levels.debug) {
            console.log(format('debug', message, meta));
        }
    },
    info: (message, meta = {}) => {
        if (currentLevel <= levels.info) {
            console.log(format('info', message, meta));
        }
    },
    warn: (message, meta = {}) => {
        if (currentLevel <= levels.warn) {
            console.warn(format('warn', message, meta));
        }
    },
    error: (message, meta = {}) => {
        if (currentLevel <= levels.error) {
            // Strip any sensitive keys before logging errors
            const safeMeta = { ...meta };
            delete safeMeta.password;
            delete safeMeta.token;
            delete safeMeta.refreshToken;
            delete safeMeta.firebaseToken;
            console.error(format('error', message, safeMeta));
        }
    },
    // Express request logger — safe: only logs method/url/status, never body
    request: (req, res, next) => {
        const start = Date.now();
        res.on('finish', () => {
            logger.info('HTTP request', {
                method: req.method,
                url:    req.originalUrl,
                status: res.statusCode,
                ms:     Date.now() - start,
                ip:     req.ip,
            });
        });
        next();
    },
};

module.exports = logger;
