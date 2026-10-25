"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.requireModerator = exports.requireAdmin = exports.requireSuperAdmin = exports.requireRole = exports.authenticateAdmin = void 0;
const jwt_util_1 = require("../utils/jwt.util");
const response_util_1 = require("../utils/response.util");
const logger_util_1 = require("../utils/logger.util");
const models_1 = require("../models");
const authenticateAdmin = async (req, res, next) => {
    try {
        const token = (0, jwt_util_1.extractToken)(req.headers.authorization);
        if (!token) {
            (0, response_util_1.sendUnauthorized)(res, 'No token provided');
            return;
        }
        const decoded = (0, jwt_util_1.verifyToken)(token);
        const admin = await models_1.Admin.findById(decoded.id);
        if (!admin || !admin.is_active) {
            (0, response_util_1.sendUnauthorized)(res, 'Invalid or expired token');
            return;
        }
        admin.last_login = new Date();
        await admin.save();
        req.admin = {
            id: admin._id.toString(),
            username: admin.username,
            email: admin.email,
            role: admin.role,
            is_active: admin.is_active,
            password_hash: admin.password_hash,
            last_login: admin.last_login,
            created_at: admin.created_at,
            updated_at: admin.updated_at
        };
        next();
    }
    catch (error) {
        logger_util_1.logger.error('Authentication error:', error);
        if (error instanceof Error) {
            if (error.message.includes('expired')) {
                (0, response_util_1.sendUnauthorized)(res, 'Token expired');
            }
            else if (error.message.includes('invalid')) {
                (0, response_util_1.sendUnauthorized)(res, 'Invalid token');
            }
            else {
                (0, response_util_1.sendUnauthorized)(res, 'Authentication failed');
            }
        }
        else {
            (0, response_util_1.sendUnauthorized)(res, 'Authentication failed');
        }
    }
};
exports.authenticateAdmin = authenticateAdmin;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.admin) {
            (0, response_util_1.sendUnauthorized)(res, 'Authentication required');
            return;
        }
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        if (!allowedRoles.includes(req.admin.role)) {
            (0, response_util_1.sendForbidden)(res, 'Insufficient permissions');
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
exports.requireSuperAdmin = (0, exports.requireRole)('super_admin');
exports.requireAdmin = (0, exports.requireRole)(['admin', 'super_admin']);
exports.requireModerator = (0, exports.requireRole)(['moderator', 'admin', 'super_admin']);
const optionalAuth = async (req, res, next) => {
    try {
        const token = (0, jwt_util_1.extractToken)(req.headers.authorization);
        if (token) {
            const decoded = (0, jwt_util_1.verifyToken)(token);
            const admin = await models_1.Admin.findById(decoded.id);
            if (admin && admin.is_active) {
                req.admin = {
                    id: admin._id.toString(),
                    username: admin.username,
                    email: admin.email,
                    role: admin.role,
                    is_active: admin.is_active,
                    password_hash: admin.password_hash,
                    last_login: admin.last_login,
                    created_at: admin.created_at,
                    updated_at: admin.updated_at
                };
            }
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.middleware.js.map