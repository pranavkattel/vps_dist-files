"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchQuerySchema = exports.taskIdSchema = exports.taskQuerySchema = exports.createTaskSchema = void 0;
const zod_1 = require("zod");
exports.createTaskSchema = zod_1.z.object({
    title: zod_1.z.string()
        .min(1, 'Title is required')
        .max(500, 'Title must be less than 500 characters'),
    description: zod_1.z.string()
        .min(1, 'Description is required')
        .max(5000, 'Description must be less than 5000 characters'),
    category: zod_1.z.string()
        .uuid('Invalid category ID'),
    difficulty: zod_1.z.enum(['easy', 'medium', 'hard'])
        .optional()
        .default('medium'),
});
exports.taskQuerySchema = zod_1.z.object({
    category: zod_1.z.string().optional(),
    difficulty: zod_1.z.enum(['easy', 'medium', 'hard']).optional(),
    search: zod_1.z.string().max(100).optional(),
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
exports.taskIdSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid task ID'),
});
exports.searchQuerySchema = zod_1.z.object({
    q: zod_1.z.string()
        .min(1, 'Search query is required')
        .max(100, 'Search query must be less than 100 characters'),
    category: zod_1.z.string().optional(),
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
//# sourceMappingURL=task.validator.js.map