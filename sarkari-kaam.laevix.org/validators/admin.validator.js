"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminIdSchema = exports.changePasswordSchema = exports.updateAdminSchema = exports.createAdminSchema = exports.adminLoginSchema = void 0;
const zod_1 = require("zod");
exports.adminLoginSchema = zod_1.z.object({
    email: zod_1.z.string()
        .email('Invalid email address')
        .max(255, 'Email must be less than 255 characters'),
    password: zod_1.z.string()
        .min(1, 'Password is required')
        .max(255, 'Password must be less than 255 characters'),
});
exports.createAdminSchema = zod_1.z.object({
    username: zod_1.z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(50, 'Username must be less than 50 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    email: zod_1.z.string()
        .email('Invalid email address')
        .max(255, 'Email must be less than 255 characters'),
    password: zod_1.z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(255, 'Password must be less than 255 characters')
        .regex(/(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
        .regex(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
        .regex(/(?=.*\d)/, 'Password must contain at least one number')
        .regex(/(?=.*[!@#$%^&*])/, 'Password must contain at least one special character'),
    role: zod_1.z.enum(['moderator', 'admin', 'super_admin']).optional().default('moderator'),
});
exports.updateAdminSchema = zod_1.z.object({
    username: zod_1.z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(50, 'Username must be less than 50 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
        .optional(),
    email: zod_1.z.string()
        .email('Invalid email address')
        .max(255, 'Email must be less than 255 characters')
        .optional(),
    role: zod_1.z.enum(['moderator', 'admin', 'super_admin']).optional(),
    is_active: zod_1.z.boolean().optional(),
});
exports.changePasswordSchema = zod_1.z.object({
    current_password: zod_1.z.string()
        .min(1, 'Current password is required'),
    new_password: zod_1.z.string()
        .min(8, 'New password must be at least 8 characters')
        .max(255, 'New password must be less than 255 characters')
        .regex(/(?=.*[a-z])/, 'New password must contain at least one lowercase letter')
        .regex(/(?=.*[A-Z])/, 'New password must contain at least one uppercase letter')
        .regex(/(?=.*\d)/, 'New password must contain at least one number')
        .regex(/(?=.*[!@#$%^&*])/, 'New password must contain at least one special character'),
    confirm_password: zod_1.z.string()
        .min(1, 'Password confirmation is required'),
}).refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
});
exports.adminIdSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid admin ID'),
});
//# sourceMappingURL=admin.validator.js.map