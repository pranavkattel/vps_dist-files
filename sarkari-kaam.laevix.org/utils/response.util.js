"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendFileUploadError = exports.sendRateLimit = exports.sendServerError = exports.sendNotFound = exports.sendForbidden = exports.sendUnauthorized = exports.sendValidationError = exports.sendPaginated = exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, data, message, statusCode = 200) => {
    const response = {
        success: true,
        data,
        ...(message && { message }),
    };
    return res.status(statusCode).json(response);
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message, statusCode = 400, code, details) => {
    const response = {
        success: false,
        error: message,
        ...(code && { code }),
        ...(details && { details }),
    };
    return res.status(statusCode).json(response);
};
exports.sendError = sendError;
const sendPaginated = (res, data, count, page, limit, message) => {
    const response = {
        success: true,
        count,
        results: data,
        ...(message && { message }),
    };
    if (page && limit) {
        response.page = page;
        response.limit = limit;
        response.total_pages = Math.ceil(count / limit);
    }
    return res.json(response);
};
exports.sendPaginated = sendPaginated;
const sendValidationError = (res, errors, message = 'Validation failed') => {
    return (0, exports.sendError)(res, message, 400, 'VALIDATION_ERROR', errors);
};
exports.sendValidationError = sendValidationError;
const sendUnauthorized = (res, message = 'Unauthorized access') => {
    return (0, exports.sendError)(res, message, 401, 'UNAUTHORIZED');
};
exports.sendUnauthorized = sendUnauthorized;
const sendForbidden = (res, message = 'Forbidden access') => {
    return (0, exports.sendError)(res, message, 403, 'FORBIDDEN');
};
exports.sendForbidden = sendForbidden;
const sendNotFound = (res, message = 'Resource not found') => {
    return (0, exports.sendError)(res, message, 404, 'NOT_FOUND');
};
exports.sendNotFound = sendNotFound;
const sendServerError = (res, message = 'Internal server error', details) => {
    return (0, exports.sendError)(res, message, 500, 'SERVER_ERROR', details);
};
exports.sendServerError = sendServerError;
const sendRateLimit = (res, message = 'Too many requests. Please try again later.') => {
    return (0, exports.sendError)(res, message, 429, 'RATE_LIMIT');
};
exports.sendRateLimit = sendRateLimit;
const sendFileUploadError = (res, message = 'File upload failed') => {
    return (0, exports.sendError)(res, message, 400, 'FILE_UPLOAD_ERROR');
};
exports.sendFileUploadError = sendFileUploadError;
//# sourceMappingURL=response.util.js.map