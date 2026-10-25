"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContributionCategories = exports.checkStatus = void 0;
const referenceCode_util_1 = require("../utils/referenceCode.util");
const response_util_1 = require("../utils/response.util");
const logger_util_1 = require("../utils/logger.util");
const error_middleware_1 = require("../middleware/error.middleware");
exports.checkStatus = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const { reference_code } = req.query;
    const result = await (0, referenceCode_util_1.findByReferenceCode)(reference_code);
    if (!result) {
        (0, response_util_1.sendNotFound)(res, `No contribution found with reference code: ${reference_code}`);
        return;
    }
    const { type, data } = result;
    let response;
    switch (type) {
        case 'task':
            response = {
                reference_code: data.reference_code,
                type: 'task',
                title: data.proposed_data?.title || data.task_title || 'N/A',
                details: `Category: ${data.proposed_data?.category_name || data.category || 'N/A'}`,
                status: data.status,
                status_display: getStatusDisplay(data.status),
                admin_note: data.admin_note,
                submitted_at: data.created_at,
                reviewed_at: data.reviewed_at,
            };
            break;
        case 'update':
            response = {
                reference_code: data.reference_code,
                type: 'update',
                task_title: data.task_title,
                category: data.category,
                office: data.office_name,
                status: data.status,
                status_display: getStatusDisplay(data.status),
                admin_note: data.admin_note,
                submitted_at: data.created_at,
                reviewed_at: data.reviewed_at,
            };
            break;
        case 'edit_suggestion':
            response = {
                reference_code: data.reference_code,
                type: 'edit_suggestion',
                task_title: data.task_title,
                section: data.section,
                status: data.status,
                status_display: getStatusDisplay(data.status),
                admin_note: data.admin_note,
                submitted_at: data.created_at,
                reviewed_at: data.reviewed_at,
            };
            break;
        default:
            (0, response_util_1.sendNotFound)(res, 'Invalid reference code type');
            return;
    }
    logger_util_1.logger.info(`Status checked for reference code: ${reference_code}`, {
        type,
        status: response.status,
        ip: req.ip,
    });
    (0, response_util_1.sendSuccess)(res, response, 'Status retrieved successfully');
});
exports.getContributionCategories = (0, error_middleware_1.asyncHandler)(async (req, res) => {
    const categories = [
        { id: 'extra_document', label: 'Extra document asked' },
        { id: 'fee_issue', label: 'Fee mismatch' },
        { id: 'token_issue', label: 'Token issue' },
        { id: 'agent_pressure', label: 'Agent pressure' },
        { id: 'long_wait', label: 'Long wait time' },
        { id: 'staff_helpful', label: 'Staff was helpful' },
        { id: 'rejected', label: 'Application rejected' },
        { id: 'other', label: 'Other' },
    ];
    (0, response_util_1.sendSuccess)(res, categories, 'Contribution categories retrieved successfully');
});
function getStatusDisplay(status) {
    switch (status.toUpperCase()) {
        case 'PENDING':
            return 'Pending Review';
        case 'ACCEPTED':
        case 'APPROVED':
            return 'Accepted';
        case 'REJECTED':
            return 'Rejected';
        default:
            return status;
    }
}
//# sourceMappingURL=status.controller.js.map