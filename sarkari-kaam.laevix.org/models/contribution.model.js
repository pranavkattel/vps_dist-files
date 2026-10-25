"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContributionStats = exports.getContributionsByTaskId = exports.updateContributionStatus = exports.createContribution = exports.getContributionById = exports.getAllContributions = void 0;
const database_1 = require("../config/database");
const referenceCode_util_1 = require("../utils/referenceCode.util");
const uuid_1 = require("uuid");
const getAllContributions = async ({ status, category, task_id, page = 1, limit = 20 } = {}) => {
    let whereClause = 'WHERE 1=1';
    let queryParams = [];
    let paramCount = 0;
    if (status) {
        paramCount++;
        whereClause += ` AND c.status = $${paramCount}`;
        queryParams.push(status);
    }
    if (category) {
        paramCount++;
        whereClause += ` AND c.category = $${paramCount}`;
        queryParams.push(category);
    }
    if (task_id) {
        paramCount++;
        whereClause += ` AND c.task_id = $${paramCount}`;
        queryParams.push(task_id);
    }
    const countQuery = `
    SELECT COUNT(*) as count
    FROM contributions c
    ${whereClause}
  `;
    const offset = (page - 1) * limit;
    const dataQuery = `
    SELECT 
      c.*,
      t.title as task_title,
      cc.label as category_label
    FROM contributions c
    LEFT JOIN tasks t ON c.task_id = t.id
    LEFT JOIN contribution_categories cc ON c.category = cc.id
    ${whereClause}
    ORDER BY c.created_at DESC
    LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
  `;
    queryParams.push(limit, offset);
    const [countResult, dataResult] = await Promise.all([
        (0, database_1.query)(countQuery, queryParams.slice(0, -2)),
        (0, database_1.query)(dataQuery, queryParams)
    ]);
    return {
        count: parseInt(countResult.rows[0].count),
        results: dataResult.rows
    };
};
exports.getAllContributions = getAllContributions;
const getContributionById = async (id) => {
    const result = await (0, database_1.query)(`
    SELECT 
      c.*,
      t.title as task_title,
      cc.label as category_label
    FROM contributions c
    LEFT JOIN tasks t ON c.task_id = t.id
    LEFT JOIN contribution_categories cc ON c.category = cc.id
    WHERE c.id = $1
  `, [id]);
    if (result.rows.length === 0) {
        return null;
    }
    const row = result.rows[0];
    return {
        ...row,
        task: row.task_title ? {
            id: row.task_id,
            title: row.task_title
        } : undefined
    };
};
exports.getContributionById = getContributionById;
const createContribution = async (contributionData) => {
    const id = (0, uuid_1.v4)();
    const reference_code = await (0, referenceCode_util_1.generateUniqueReferenceCode)('update');
    const result = await (0, database_1.query)(`
    INSERT INTO contributions (
      id, reference_code, task_id, office_name, office_id, category, outcome,
      note, image, contributor_name, is_anonymous, status, ip_address, user_agent,
      created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'PENDING', $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING *
  `, [
        id,
        reference_code,
        contributionData.task_id,
        contributionData.office_name,
        contributionData.office_id,
        contributionData.category,
        contributionData.outcome,
        contributionData.note,
        contributionData.image,
        contributionData.contributor_name,
        contributionData.is_anonymous !== false,
        contributionData.ip_address,
        contributionData.user_agent
    ]);
    return {
        contribution: result.rows[0],
        reference_code
    };
};
exports.createContribution = createContribution;
const updateContributionStatus = async (id, status, admin_id, admin_note) => {
    const result = await (0, database_1.query)(`
    UPDATE contributions 
    SET 
      status = $1,
      admin_note = $2,
      reviewed_at = CURRENT_TIMESTAMP,
      reviewed_by = $3,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING *
  `, [status, admin_note, admin_id, id]);
    return result.rows[0] || null;
};
exports.updateContributionStatus = updateContributionStatus;
const getContributionsByTaskId = async (task_id, limit = 10) => {
    const result = await (0, database_1.query)(`
    SELECT 
      c.id,
      c.office_name,
      c.category,
      c.note,
      c.outcome,
      c.created_at,
      c.status,
      cc.label as category_label
    FROM contributions c
    LEFT JOIN contribution_categories cc ON c.category = cc.id
    WHERE c.task_id = $1 AND c.status = 'ACCEPTED'
    ORDER BY c.created_at DESC
    LIMIT $2
  `, [task_id, limit]);
    return result.rows;
};
exports.getContributionsByTaskId = getContributionsByTaskId;
const getContributionStats = async () => {
    const result = await (0, database_1.query)(`
    SELECT 
      COUNT(*) FILTER (WHERE status = 'PENDING') as pending,
      COUNT(*) FILTER (WHERE status = 'ACCEPTED') as accepted,
      COUNT(*) FILTER (WHERE status = 'REJECTED') as rejected,
      COUNT(*) as total
    FROM contributions
  `);
    return result.rows[0];
};
exports.getContributionStats = getContributionStats;
//# sourceMappingURL=contribution.model.js.map