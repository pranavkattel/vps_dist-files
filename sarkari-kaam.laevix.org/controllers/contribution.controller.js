"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectContribution = exports.approveContribution = exports.getContributionById = exports.getContributions = exports.submitUpdate = void 0;
const models_1 = require("../models");
const response_util_1 = require("../utils/response.util");
const logger_util_1 = require("../utils/logger.util");
const storage_1 = require("../config/storage");
const error_middleware_1 = require("../middleware/error.middleware");
const referenceCode_util_1 = require("../utils/referenceCode.util");
exports.submitUpdate = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { task_id, office_name, office_id, category, outcome, note, contributor_name, is_anonymous, } = req.body;
    const image = req.file?.filename;
    const ip_address = req.ip;
    const user_agent = req.get('user-agent');
    const task = await models_1.Task.findById(task_id);
    if (!task) {
        (0, response_util_1.sendError)(res, 'Task not found', 404);
        return;
    }
    const result = await models_1.Contribution.create({
        office_name,
        category,
        note: note || outcome || '',
        contributor_name: is_anonymous ? 'Anonymous' : (contributor_name || 'User'),
        contributor_email: 'anonymous@example.com',
        contribution_type: 'new_task',
        status: 'pending',
        reference_code: await (0, referenceCode_util_1.generateUniqueReferenceCode)('update'),
        task_slug: task.slug,
        task_title: task.title,
        proposed_data: {
            title: task.title,
            description: task.description,
        },
    });
    logger_util_1.logger.info(`New contribution submitted: ${result.reference_code}`, {
        contributionId: result._id,
        taskId: task_id,
        category,
        office: office_name,
        ip: ip_address,
    });
    (0, response_util_1.sendSuccess)(res, {
        reference_code: result.reference_code,
        status: 'PENDING',
    }, 'Submission received. Thank you for contributing!', 201);
});
exports.getContributions = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { status, category, task_id, page, limit } = req.query;
    const pageNum = parseInt(page || '1');
    const limitNum = parseInt(limit || '20');
    const contributions = await models_1.Contribution.find({
        ...(status && { status }),
        ...(category && { category }),
        ...(task_id && { task_id }),
    })
        .populate('task_id', 'title slug')
        .sort({ created_at: -1 })
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum);
    const total = await models_1.Contribution.countDocuments({
        ...(status && { status }),
        ...(category && { category }),
        ...(task_id && { task_id }),
    });
    const result = { results: contributions, total, page: pageNum, totalPages: Math.ceil(total / limitNum) };
    const contributionsWithImageUrls = result.results.map((contribution) => ({
        ...contribution,
        image: contribution.image ? (0, storage_1.getFileUrl)(contribution.image, 'contributions') : null,
        task: contribution.task_title ? {
            id: contribution.task_id,
            title: contribution.task_title,
        } : undefined,
    }));
    (0, response_util_1.sendPaginated)(res, contributionsWithImageUrls, total, pageNum, limitNum, 'Contributions retrieved successfully');
});
exports.getContributionById = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        (0, response_util_1.sendNotFound)(res, 'Contribution ID is required');
        return;
    }
    const contribution = await models_1.Contribution.findById(id);
    if (!contribution) {
        (0, response_util_1.sendNotFound)(res, 'Contribution not found');
        return;
    }
    const contributionWithImageUrl = {
        ...contribution.toObject(),
        image: contribution.contribution_data?.image ? (0, storage_1.getFileUrl)(contribution.contribution_data.image, 'contributions') : null,
    };
    (0, response_util_1.sendSuccess)(res, contributionWithImageUrl, 'Contribution retrieved successfully');
});
exports.approveContribution = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        (0, response_util_1.sendNotFound)(res, 'Contribution ID is required');
        return;
    }
    const { admin_note } = req.body;
    const admin = req.admin;
    const contribution = await models_1.Contribution.findById(id);
    if (!contribution) {
        (0, response_util_1.sendNotFound)(res, 'Contribution not found');
        return;
    }
    if (contribution.status !== 'pending') {
        (0, response_util_1.sendError)(res, 'Only pending contributions can be approved', 400);
        return;
    }
    const updatedContribution = await models_1.Contribution.findByIdAndUpdate(id, {
        status: 'approved',
        admin_note,
        reviewed_by: admin.id,
        reviewed_at: new Date(),
    }, { new: true });
    logger_util_1.logger.info(`Contribution approved by admin: ${contribution.reference_code}`, {
        contributionId: id,
        adminId: admin.id,
        adminEmail: admin.email,
    });
    (0, response_util_1.sendSuccess)(res, {
        reference_code: contribution.reference_code,
        status: 'approved',
    }, 'Contribution approved successfully');
});
exports.rejectContribution = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id) {
        (0, response_util_1.sendNotFound)(res, 'Contribution ID is required');
        return;
    }
    const { admin_note } = req.body;
    const admin = req.admin;
    const contribution = await models_1.Contribution.findById(id);
    if (!contribution) {
        (0, response_util_1.sendNotFound)(res, 'Contribution not found');
        return;
    }
    if (contribution.status !== 'pending') {
        (0, response_util_1.sendError)(res, 'Only pending contributions can be rejected', 400);
        return;
    }
    const updatedContribution = await models_1.Contribution.findByIdAndUpdate(id, {
        status: 'rejected',
        admin_note,
        reviewed_by: admin.id,
        reviewed_at: new Date(),
    }, { new: true });
    logger_util_1.logger.info(`Contribution rejected by admin: ${contribution.reference_code}`, {
        contributionId: id,
        adminId: admin.id,
        adminEmail: admin.email,
        reason: admin_note,
    });
    (0, response_util_1.sendSuccess)(res, {
        reference_code: contribution.reference_code,
        status: 'rejected',
    }, 'Contribution rejected');
});
//# sourceMappingURL=contribution.controller.js.map