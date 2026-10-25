"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryById = exports.getCategories = void 0;
const models_1 = require("../models");
const response_util_1 = require("../utils/response.util");
const logger_util_1 = require("../utils/logger.util");
const error_middleware_1 = require("../middleware/error.middleware");
const slugify_1 = __importDefault(require("slugify"));
exports.getCategories = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const categories = await models_1.Category.find().sort({ display_order: 1 });
    (0, response_util_1.sendSuccess)(res, categories, 'Categories retrieved successfully');
});
exports.getCategoryById = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        (0, response_util_1.sendNotFound)(res, 'Category ID is required');
        return;
    }
    const category = await models_1.Category.findById(id);
    if (!category) {
        (0, response_util_1.sendNotFound)(res, 'Category not found');
        return;
    }
    (0, response_util_1.sendSuccess)(res, category, 'Category retrieved successfully');
});
exports.createCategory = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { name, name_nepali, description, icon_url, display_order } = req.body;
    const admin = req.admin;
    const category = await models_1.Category.create({
        name,
        description,
        icon: icon_url || '📄',
        slug: (0, slugify_1.default)(name, { lower: true }),
        task_count: 0
    });
    logger_util_1.logger.info(`New category created: ${category.name}`, {
        categoryId: category.id,
        adminId: admin.id,
        adminEmail: admin.email,
    });
    (0, response_util_1.sendSuccess)(res, category, 'Category created successfully', 201);
});
exports.updateCategory = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        (0, response_util_1.sendNotFound)(res, 'Category ID is required');
        return;
    }
    const { name, name_nepali, description, icon_url, display_order } = req.body;
    const admin = req.admin;
    const existingCategory = await models_1.Category.findById(id);
    if (!existingCategory) {
        (0, response_util_1.sendNotFound)(res, 'Category not found');
        return;
    }
    const updatedCategory = await models_1.Category.findByIdAndUpdate(id, {
        name,
        description,
        icon: icon_url,
    }, { new: true });
    if (!updatedCategory) {
        (0, response_util_1.sendError)(res, 'Failed to update category', 500);
        return;
    }
    logger_util_1.logger.info(`Category updated: ${updatedCategory.name}`, {
        categoryId: id,
        adminId: admin.id,
        adminEmail: admin.email,
    });
    (0, response_util_1.sendSuccess)(res, updatedCategory, 'Category updated successfully');
});
exports.deleteCategory = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        (0, response_util_1.sendNotFound)(res, 'Category ID is required');
        return;
    }
    const admin = req.admin;
    const existingCategory = await models_1.Category.findById(id);
    if (!existingCategory) {
        (0, response_util_1.sendNotFound)(res, 'Category not found');
        return;
    }
    try {
        const deleted = await models_1.Category.findByIdAndDelete(id);
        if (!deleted) {
            (0, response_util_1.sendError)(res, 'Failed to delete category', 500);
            return;
        }
        logger_util_1.logger.info(`Category deleted: ${existingCategory.name}`, {
            categoryId: id,
            adminId: admin.id,
            adminEmail: admin.email,
        });
        (0, response_util_1.sendSuccess)(res, null, 'Category deleted successfully');
    }
    catch (error) {
        if (error.message.includes('existing tasks')) {
            (0, response_util_1.sendError)(res, 'Cannot delete category with existing tasks', 400);
            return;
        }
        throw error;
    }
});
//# sourceMappingURL=category.controller.js.map