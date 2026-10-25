"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchTasks = exports.submitTask = exports.getTaskById = exports.getTasks = void 0;
const models_1 = require("../models");
const response_util_1 = require("../utils/response.util");
const logger_util_1 = require("../utils/logger.util");
const storage_1 = require("../config/storage");
const error_middleware_1 = require("../middleware/error.middleware");
const slugify_1 = __importDefault(require("slugify"));
exports.getTasks = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { category, difficulty, search, page, limit } = req.query;
    const pageNum = parseInt(page || '1');
    const limitNum = parseInt(limit || '20');
    const query = {
        ...(category && { category_slug: category }),
        ...(difficulty && { difficulty }),
        ...(search && { $or: [{ title: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }] })
    };
    const tasks = await models_1.Task.find(query)
        .sort({ created_at: -1 })
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum);
    const total = await models_1.Task.countDocuments(query);
    const tasksWithImageUrls = tasks.map((task) => {
        const taskObj = task.toObject ? task.toObject() : task;
        return {
            ...taskObj,
            cover_image: taskObj.cover_image ? (0, storage_1.getFileUrl)(taskObj.cover_image, 'tasks') : null,
        };
    });
    (0, response_util_1.sendPaginated)(res, tasksWithImageUrls, total, pageNum, limitNum, 'Tasks retrieved successfully');
});
exports.getTaskById = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        (0, response_util_1.sendNotFound)(res, 'Task ID is required');
        return;
    }
    const task = await models_1.Task.findById(id);
    if (!task) {
        (0, response_util_1.sendNotFound)(res, 'Task not found');
        return;
    }
    const taskObj = task.toObject();
    const taskWithImageUrls = {
        ...taskObj,
        cover_image: taskObj.cover_image ? (0, storage_1.getFileUrl)(taskObj.cover_image, 'tasks') : null,
        documents: (taskObj.documents || []).map((doc) => ({
            ...doc,
            sample_image: doc.sample_image ? (0, storage_1.getFileUrl)(doc.sample_image, 'documents') : null,
        })),
        ground_reality: (taskObj.ground_reality || []).map((gr) => ({
            ...gr,
            image: gr.image ? (0, storage_1.getFileUrl)(gr.image, 'ground_reality') : null,
        })),
        scam_warnings: (taskObj.scam_warnings || []).map((sw) => ({
            ...sw,
            image: sw.image ? (0, storage_1.getFileUrl)(sw.image, 'scam_warnings') : null,
        })),
    };
    (0, response_util_1.sendSuccess)(res, taskWithImageUrls, 'Task retrieved successfully');
});
exports.submitTask = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { title, description, category, difficulty } = req.body;
    const image = req.file?.filename;
    const ip_address = req.ip;
    const user_agent = req.get('user-agent');
    const categoryDoc = await models_1.Category.findById(category);
    if (!categoryDoc) {
        (0, response_util_1.sendError)(res, 'Category not found', 400);
        return;
    }
    const slug = (0, slugify_1.default)(title, { lower: true, strict: true });
    const result = await models_1.Task.create({
        title,
        description,
        slug,
        category_id: categoryDoc._id,
        category_name: categoryDoc.name,
        category_slug: categoryDoc.slug,
        difficulty: difficulty || 'medium',
        estimated_time: 'Unknown',
        status: 'draft',
        ...(image && { cover_image: image }),
    });
    logger_util_1.logger.info(`New task submitted: ${result.title}`, {
        taskId: result._id,
        title: result.title,
        ip: ip_address,
    });
    (0, response_util_1.sendSuccess)(res, {
        id: result._id,
        title: result.title,
        status: 'draft',
    }, 'Task submitted for review. Thank you!', 201);
});
exports.searchTasks = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { q, category, page, limit } = req.query;
    if (!q) {
        (0, response_util_1.sendError)(res, 'Search query is required', 400);
        return;
    }
    const pageNum = parseInt(page || '1');
    const limitNum = parseInt(limit || '20');
    const searchQuery = {
        $or: [
            { title: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
        ],
        ...(category && { category_slug: category }),
    };
    const tasks = await models_1.Task.find(searchQuery)
        .sort({ created_at: -1 })
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum);
    const total = await models_1.Task.countDocuments(searchQuery);
    const tasksWithImageUrls = tasks.map((task) => {
        const taskObj = task.toObject ? task.toObject() : task;
        return {
            ...taskObj,
            cover_image: taskObj.cover_image ? (0, storage_1.getFileUrl)(taskObj.cover_image, 'tasks') : null,
        };
    });
    (0, response_util_1.sendPaginated)(res, tasksWithImageUrls, total, pageNum, limitNum, `Found ${total} tasks matching "${q}"`);
});
//# sourceMappingURL=task.controller.js.map