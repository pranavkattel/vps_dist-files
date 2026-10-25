"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadLimiter = exports.searchLimiter = exports.adminAuthLimiter = exports.generalLimiter = exports.taskSubmissionLimiter = exports.statusCheckLimiter = exports.contributionLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const rate_limit_redis_1 = __importDefault(require("rate-limit-redis"));
const redis_1 = require("../config/redis");
const env_1 = require("../config/env");
const response_util_1 = require("../utils/response.util");
const logger_util_1 = require("../utils/logger.util");
const createRateLimiter = ({ windowMs, max, message, prefix, skipSuccessfulRequests = false, skipFailedRequests = false, }) => {
    return (0, express_rate_limit_1.default)({
        windowMs,
        max,
        message: {
            success: false,
            error: message,
        },
        standardHeaders: true,
        legacyHeaders: false,
        skipSuccessfulRequests,
        skipFailedRequests,
        ...(redis_1.redisClient && {
            store: new rate_limit_redis_1.default({
                sendCommand: (...args) => redis_1.redisClient.sendCommand(args),
                prefix: `rl:${prefix}:`,
            }),
        }),
        keyGenerator: (req) => {
            return req.ip || req.connection.remoteAddress || 'unknown';
        },
        handler: (req, res) => {
            logger_util_1.logger.warn(`Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
            (0, response_util_1.sendRateLimit)(res, message);
        },
        skip: (req) => {
            if (env_1.env.IS_DEVELOPMENT && (req.ip === '127.0.0.1' || req.ip === '::1')) {
                return true;
            }
            return false;
        },
    });
};
exports.contributionLimiter = createRateLimiter({
    windowMs: env_1.env.RATE_LIMIT_WINDOW_MS,
    max: env_1.env.RATE_LIMIT_MAX_CONTRIBUTION,
    message: 'Too many contribution submissions. Please try again later.',
    prefix: 'contrib',
    skipSuccessfulRequests: false,
});
exports.statusCheckLimiter = createRateLimiter({
    windowMs: env_1.env.RATE_LIMIT_WINDOW_MS,
    max: env_1.env.RATE_LIMIT_MAX_STATUS_CHECK,
    message: 'Too many status check requests. Please try again later.',
    prefix: 'status',
    skipSuccessfulRequests: true,
});
exports.taskSubmissionLimiter = createRateLimiter({
    windowMs: env_1.env.RATE_LIMIT_WINDOW_MS,
    max: 5,
    message: 'Too many task submissions. Please try again later.',
    prefix: 'task_submit',
    skipSuccessfulRequests: false,
});
exports.generalLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP. Please try again later.',
    prefix: 'general',
    skipSuccessfulRequests: true,
});
exports.adminAuthLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many login attempts. Please try again later.',
    prefix: 'admin_auth',
    skipSuccessfulRequests: true,
});
exports.searchLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 30,
    message: 'Too many search requests. Please try again later.',
    prefix: 'search',
    skipSuccessfulRequests: true,
});
exports.uploadLimiter = createRateLimiter({
    windowMs: env_1.env.RATE_LIMIT_WINDOW_MS,
    max: 10,
    message: 'Too many file uploads. Please try again later.',
    prefix: 'upload',
    skipSuccessfulRequests: false,
});
//# sourceMappingURL=rateLimit.middleware.js.map