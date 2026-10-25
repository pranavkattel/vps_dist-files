"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contributionIdSchema = exports.rejectContributionSchema = exports.approveContributionSchema = exports.contributionQuerySchema = exports.createContributionSchema = void 0;
const zod_1 = require("zod");
const contributionCategories = [
    'extra_document',
    'fee_issue',
    'token_issue',
    'agent_pressure',
    'long_wait',
    'staff_helpful',
    'rejected',
    'other'
];
exports.createContributionSchema = zod_1.z.object({
    task_id: zod_1.z.string().uuid('Invalid task ID'),
    office_name: zod_1.z.string()
        .min(1, 'Office name is required')
        .max(255, 'Office name must be less than 255 characters'),
    office_id: zod_1.z.string().uuid().optional(),
    category: zod_1.z.enum(contributionCategories, {
        errorMap: () => ({ message: 'Invalid contribution category' })
    }),
    outcome: zod_1.z.enum(['COMPLETED', 'PENDING', 'REJECTED']).optional(),
    note: zod_1.z.string()
        .min(1, 'Note is required')
        .max(200, 'Note must be less than 200 characters'),
    contributor_name: zod_1.z.string()
        .max(255, 'Contributor name must be less than 255 characters')
        .optional(),
    is_anonymous: zod_1.z.boolean().optional().default(true),
});
exports.contributionQuerySchema = zod_1.z.object({
    status: zod_1.z.enum(['PENDING', 'ACCEPTED', 'REJECTED']).optional(),
    category: zod_1.z.enum(contributionCategories).optional(),
    task_id: zod_1.z.string().uuid().optional(),
    page: zod_1.z.string()
        .transform((val) => parseInt(val))
        .refine((val) => !isNaN(val) && val > 0, 'Page must be a positive number')
        .optional()
        .default('1'),
    limit: zod_1.z.string()
        .transform((val) => parseInt(val))
        .refine((val) => !isNaN(val) && val > 0 && val <= 50, 'Limit must be between 1 and 50')
        .optional()
        .default('20'),
});
exports.approveContributionSchema = zod_1.z.object({
    admin_note: zod_1.z.string()
        .max(500, 'Admin note must be less than 500 characters')
        .optional(),
});
exports.rejectContributionSchema = zod_1.z.object({
    admin_note: zod_1.z.string()
        .min(1, 'Admin note is required for rejection')
        .max(500, 'Admin note must be less than 500 characters'),
});
exports.contributionIdSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid contribution ID'),
});
//# sourceMappingURL=contribution.validator.js.map