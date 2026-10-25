"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = void 0;
const zod_1 = require("zod");
const multer_1 = __importDefault(require("multer"));
const response_util_1 = require("../utils/response.util");
const logger_util_1 = require("../utils/logger.util");
const env_1 = require("../config/env");
const errorHandler = (error, req, res, next) => {
    logger_util_1.logger.error('Error occurred:', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('user-agent'),
    });
    if (error instanceof zod_1.ZodError) {
        const errors = error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
        }));
        (0, response_util_1.sendValidationError)(res, errors, 'Invalid input data');
        return;
    }
    if (error instanceof multer_1.default.MulterError) {
        let message = 'File upload error';
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                message = 'File size too large. Maximum size is 5MB.';
                break;
            case 'LIMIT_FILE_COUNT':
                message = 'Too many files uploaded.';
                break;
            case 'LIMIT_UNEXPECTED_FILE':
                message = 'Unexpected file field.';
                break;
            case 'LIMIT_FIELD_KEY':
                message = 'Field name too long.';
                break;
            case 'LIMIT_FIELD_VALUE':
                message = 'Field value too long.';
                break;
            case 'LIMIT_FIELD_COUNT':
                message = 'Too many fields.';
                break;
            case 'LIMIT_PART_COUNT':
                message = 'Too many parts.';
                break;
        }
        (0, response_util_1.sendFileUploadError)(res, message);
        return;
    }
    if (error.name === 'MongoServerError' || error.name === 'MongoError') {
        let message = 'Database operation failed';
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0] || 'field';
            message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
        }
        if (!env_1.env.IS_DEVELOPMENT) {
            message = 'Database operation failed';
        }
        (0, response_util_1.sendValidationError)(res, [{
                field: 'database',
                message,
                code: error.code?.toString() || 'DB_ERROR'
            }]);
        return;
    }
    if (error.code && typeof error.code === 'string' && error.code.startsWith('23')) {
        let message = 'Database constraint violation';
        if (error.code === '23505') {
            message = 'Data already exists';
            if (error.detail && error.detail.includes('email')) {
                message = 'Email already exists';
            }
            else if (error.detail && error.detail.includes('username')) {
                message = 'Username already exists';
            }
            else if (error.detail && error.detail.includes('slug')) {
                message = 'URL slug already exists';
            }
            else if (error.detail && error.detail.includes('reference_code')) {
                message = 'Reference code already exists';
            }
        }
        else if (error.code === '23503') {
            message = 'Referenced resource does not exist';
        }
        else if (error.code === '23502') {
            message = 'Required field is missing';
        }
        if (!env_1.env.IS_DEVELOPMENT) {
            message = 'Database operation failed';
        }
        (0, response_util_1.sendValidationError)(res, [{
                field: 'database',
                message,
                code: error.code
            }]);
        return;
    }
    if (error.name === 'JsonWebTokenError') {
        res.status(401).json({
            success: false,
            error: 'Invalid authentication token',
        });
        return;
    }
    if (error.name === 'TokenExpiredError') {
        res.status(401).json({
            success: false,
            error: 'Authentication token expired',
        });
        return;
    }
    if (error.message && error.message.includes('Redis')) {
        logger_util_1.logger.warn('Redis error (continuing without cache):', error.message);
        next();
        return;
    }
    if (error.status || error.statusCode) {
        const statusCode = error.status || error.statusCode;
        const message = error.message || 'An error occurred';
        res.status(statusCode).json({
            success: false,
            error: message,
        });
        return;
    }
    const message = env_1.env.IS_DEVELOPMENT
        ? error.message
        : 'Internal server error';
    const details = env_1.env.IS_DEVELOPMENT
        ? {
            stack: error.stack,
            name: error.name,
            message: error.message,
        }
        : undefined;
    (0, response_util_1.sendServerError)(res, message, details);
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.originalUrl,
        method: req.method,
    });
};
exports.notFoundHandler = notFoundHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=error.middleware.js.map