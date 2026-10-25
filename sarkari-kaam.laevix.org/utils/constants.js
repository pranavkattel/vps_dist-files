"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RATE_LIMITS = exports.FILE_LIMITS = exports.ADMIN_ROLES = exports.CONTRIBUTION_TYPES = exports.CONTRIBUTION_STATUS = exports.TASK_STATUS = exports.DIFFICULTY_LEVELS = exports.RESPONSE_CODES = exports.PAGINATION = void 0;
exports.PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    MIN_LIMIT: 1,
};
exports.RESPONSE_CODES = {
    SUCCESS: 'SUCCESS',
    ERROR: 'ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    SERVER_ERROR: 'SERVER_ERROR',
};
exports.DIFFICULTY_LEVELS = {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard',
};
exports.TASK_STATUS = {
    DRAFT: 'draft',
    PUBLISHED: 'published',
};
exports.CONTRIBUTION_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
};
exports.CONTRIBUTION_TYPES = {
    NEW_TASK: 'new_task',
    EDIT_TASK: 'edit_task',
    GROUND_REALITY: 'ground_reality',
    SCAM_WARNING: 'scam_warning',
};
exports.ADMIN_ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    MODERATOR: 'moderator',
};
exports.FILE_LIMITS = {
    MAX_FILE_SIZE: 5 * 1024 * 1024,
    MAX_FILES: 5,
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
};
exports.RATE_LIMITS = {
    GENERAL: {
        WINDOW_MS: 15 * 60 * 1000,
        MAX_REQUESTS: 100,
    },
    AUTH: {
        WINDOW_MS: 15 * 60 * 1000,
        MAX_REQUESTS: 5,
    },
    CONTRIBUTION: {
        WINDOW_MS: 60 * 60 * 1000,
        MAX_REQUESTS: 10,
    },
};
//# sourceMappingURL=constants.js.map