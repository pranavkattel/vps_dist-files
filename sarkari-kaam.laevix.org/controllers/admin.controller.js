"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.changePassword = exports.updateProfile = exports.getProfile = exports.getDashboard = exports.login = void 0;
const models_1 = require("../models");
const response_util_1 = require("../utils/response.util");
const jwt_util_1 = require("../utils/jwt.util");
const bcrypt_util_1 = require("../utils/bcrypt.util");
const logger_util_1 = require("../utils/logger.util");
const error_middleware_1 = require("../middleware/error.middleware");
exports.login = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    const ip_address = req.ip;
    const user_agent = req.get('user-agent');
    const admin = await models_1.Admin.findOne({ email, is_active: true });
    if (!admin) {
        logger_util_1.logger.warn('Failed login attempt - user not found', {
            email,
            ip: ip_address,
            userAgent: user_agent,
        });
        (0, response_util_1.sendUnauthorized)(res, 'Invalid email or password');
        return;
    }
    const isValidPassword = await (0, bcrypt_util_1.verifyPassword)(password, admin.password_hash);
    if (!isValidPassword) {
        logger_util_1.logger.warn('Failed login attempt - invalid password', {
            adminId: admin._id,
            email,
            ip: ip_address,
            userAgent: user_agent,
        });
        (0, response_util_1.sendUnauthorized)(res, 'Invalid email or password');
        return;
    }
    const tokenPayload = {
        id: admin._id.toString(),
        email: admin.email,
        role: admin.role,
        username: admin.username
    };
    const token = (0, jwt_util_1.generateToken)(tokenPayload);
    admin.last_login = new Date();
    await admin.save();
    logger_util_1.logger.info('Admin login successful', {
        adminId: admin._id,
        email: admin.email,
        role: admin.role,
        ip: ip_address,
    });
    (0, response_util_1.sendSuccess)(res, {
        token,
        admin: {
            id: admin._id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
            last_login: admin.last_login,
        },
    }, 'Login successful');
});
exports.getDashboard = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const pendingContributions = await models_1.Contribution.countDocuments({ status: 'pending' });
    const totalTasks = await models_1.Task.countDocuments({ status: 'PUBLISHED' });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const totalViewsToday = await models_1.Task.aggregate([
        {
            $match: {
                updated_at: { $gte: today }
            }
        },
        {
            $group: {
                _id: null,
                total: { $sum: '$view_count' }
            }
        }
    ]);
    const recentContributions = await models_1.Contribution.find({ status: 'pending' })
        .sort({ created_at: -1 })
        .limit(5)
        .select('reference_code contributor_name contribution_type status created_at task_slug')
        .lean();
    const stats = {
        pending_tasks: 0,
        pending_contributions: pendingContributions,
        pending_edit_suggestions: 0,
        total_tasks: totalTasks,
        total_views_today: totalViewsToday[0]?.total || 0,
        recent_contributions: recentContributions,
        recent_edit_suggestions: [],
    };
    (0, response_util_1.sendSuccess)(res, stats, 'Dashboard data retrieved successfully');
});
exports.getProfile = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const admin = req.admin;
    (0, response_util_1.sendSuccess)(res, {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        is_active: admin.is_active,
        last_login: admin.last_login,
        created_at: admin.created_at,
    }, 'Profile retrieved successfully');
});
exports.updateProfile = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const admin = req.admin;
    const { username, email } = req.body;
    const updatedAdmin = await models_1.Admin.findByIdAndUpdate(admin.id, {
        username: username || admin.username,
        email: email || admin.email,
        updated_at: new Date()
    }, { new: true, runValidators: true });
    if (!updatedAdmin) {
        (0, response_util_1.sendError)(res, 'Failed to update profile', 500);
        return;
    }
    logger_util_1.logger.info('Admin profile updated', {
        adminId: admin.id,
        email: admin.email,
    });
    (0, response_util_1.sendSuccess)(res, updatedAdmin.toSafeObject(), 'Profile updated successfully');
});
exports.changePassword = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const admin = req.admin;
    const { current_password, new_password } = req.body;
    const fullAdmin = await models_1.Admin.findById(admin.id);
    if (!fullAdmin) {
        (0, response_util_1.sendError)(res, 'Admin not found', 404);
        return;
    }
    const isValidPassword = await (0, bcrypt_util_1.verifyPassword)(current_password, fullAdmin.password_hash);
    if (!isValidPassword) {
        (0, response_util_1.sendError)(res, 'Current password is incorrect', 400);
        return;
    }
    const newPasswordHash = await (0, bcrypt_util_1.hashPassword)(new_password);
    fullAdmin.password_hash = newPasswordHash;
    fullAdmin.updated_at = new Date();
    await fullAdmin.save();
    logger_util_1.logger.info('Admin password changed', {
        adminId: admin.id,
        email: admin.email,
    });
    (0, response_util_1.sendSuccess)(res, null, 'Password changed successfully');
});
exports.logout = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const admin = req.admin;
    logger_util_1.logger.info('Admin logout', {
        adminId: admin.id,
        email: admin.email,
    });
    (0, response_util_1.sendSuccess)(res, null, 'Logged out successfully');
});
//# sourceMappingURL=admin.controller.js.map