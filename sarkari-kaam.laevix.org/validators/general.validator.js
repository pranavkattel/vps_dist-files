"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateImageFile = exports.createOfficeSchema = exports.createCategorySchema = exports.paginationSchema = exports.uuidSchema = exports.referenceCodeSchema = void 0;
const zod_1 = require("zod");
exports.referenceCodeSchema = zod_1.z.object({
    reference_code: zod_1.z.string()
        .min(1, 'Reference code is required')
        .regex(/^(TASK|UPD|EDIT)-[A-Z0-9]{5}$/, 'Invalid reference code format'),
});
exports.uuidSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid ID format'),
});
exports.paginationSchema = zod_1.z.object({
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
exports.createCategorySchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(1, 'Category name is required')
        .max(255, 'Category name must be less than 255 characters'),
    name_nepali: zod_1.z.string()
        .max(255, 'Nepali name must be less than 255 characters')
        .optional(),
    description: zod_1.z.string()
        .max(1000, 'Description must be less than 1000 characters')
        .optional(),
    icon_url: zod_1.z.string()
        .url('Invalid icon URL')
        .max(500, 'Icon URL must be less than 500 characters')
        .optional(),
    display_order: zod_1.z.number()
        .int('Display order must be an integer')
        .min(0, 'Display order must be non-negative')
        .optional()
        .default(0),
});
exports.createOfficeSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(1, 'Office name is required')
        .max(255, 'Office name must be less than 255 characters'),
    name_nepali: zod_1.z.string()
        .max(255, 'Nepali name must be less than 255 characters')
        .optional(),
    location: zod_1.z.string()
        .max(255, 'Location must be less than 255 characters')
        .optional(),
    office_type: zod_1.z.enum(['dao', 'ward', 'passport', 'transport', 'iro'], {
        errorMap: () => ({ message: 'Invalid office type' })
    }),
    contact_info: zod_1.z.string()
        .max(1000, 'Contact info must be less than 1000 characters')
        .optional(),
});
const validateImageFile = (file) => {
    if (!file)
        return true;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
        throw new Error('Only image files are allowed (jpeg, jpg, png, webp)');
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        throw new Error('File size must be less than 5MB');
    }
    return true;
};
exports.validateImageFile = validateImageFile;
//# sourceMappingURL=general.validator.js.map