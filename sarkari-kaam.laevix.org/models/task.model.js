"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchTasks = exports.deleteTask = exports.updateTask = exports.createTask = exports.getTaskById = exports.getAllTasks = void 0;
const database_1 = require("../config/database");
const slug_util_1 = require("../utils/slug.util");
const uuid_1 = require("uuid");
const getAllTasks = async ({ category, difficulty, search, page = 1, limit = 20, status = 'ACCEPTED' } = {}) => {
    let whereClause = 'WHERE t.status = $1';
    let queryParams = [status];
    let paramCount = 1;
    if (category) {
        paramCount++;
        whereClause += ` AND c.slug = $${paramCount}`;
        queryParams.push(category);
    }
    if (difficulty) {
        paramCount++;
        whereClause += ` AND t.difficulty = $${paramCount}`;
        queryParams.push(difficulty);
    }
    if (search) {
        paramCount++;
        whereClause += ` AND (t.title ILIKE $${paramCount} OR t.description ILIKE $${paramCount})`;
        queryParams.push(`%${search}%`);
    }
    const countQuery = `
    SELECT COUNT(*) as count
    FROM tasks t
    LEFT JOIN categories c ON t.category_id = c.id
    ${whereClause}
  `;
    const offset = (page - 1) * limit;
    const dataQuery = `
    SELECT 
      t.id,
      t.title,
      t.title_nepali,
      t.description,
      t.slug,
      t.difficulty,
      t.estimated_time,
      t.image,
      t.last_verified_at,
      t.view_count,
      c.name as category_name,
      c.slug as category_slug
    FROM tasks t
    LEFT JOIN categories c ON t.category_id = c.id
    ${whereClause}
    ORDER BY t.updated_at DESC
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
exports.getAllTasks = getAllTasks;
const getTaskById = async (id) => {
    const taskResult = await (0, database_1.query)(`
    SELECT 
      t.*,
      c.name as category_name,
      c.slug as category_slug
    FROM tasks t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.id = $1 AND t.status = 'ACCEPTED'
  `, [id]);
    if (taskResult.rows.length === 0) {
        return null;
    }
    const task = taskResult.rows[0];
    const stepsResult = await (0, database_1.query)(`
    SELECT * FROM steps 
    WHERE task_id = $1 
    ORDER BY step_number ASC
  `, [id]);
    const documentsResult = await (0, database_1.query)(`
    SELECT * FROM documents 
    WHERE task_id = $1 
    ORDER BY is_mandatory DESC, name ASC
  `, [id]);
    const warningsResult = await (0, database_1.query)(`
    SELECT * FROM scam_warnings 
    WHERE task_id = $1 
    ORDER BY severity DESC, created_at DESC
  `, [id]);
    const contributionsResult = await (0, database_1.query)(`
    SELECT 
      c.id,
      c.office_name,
      c.category,
      c.note,
      c.created_at,
      c.status,
      cc.label as category_label
    FROM contributions c
    LEFT JOIN contribution_categories cc ON c.category = cc.id
    WHERE c.task_id = $1 AND c.status = 'ACCEPTED'
    ORDER BY c.created_at DESC
    LIMIT 10
  `, [id]);
    await (0, database_1.query)('UPDATE tasks SET view_count = view_count + 1 WHERE id = $1', [id]);
    return {
        ...task,
        category: task.category_name ? {
            name: task.category_name,
            slug: task.category_slug
        } : undefined,
        steps: stepsResult.rows,
        documents: documentsResult.rows,
        scam_warnings: warningsResult.rows,
        contributions: contributionsResult.rows
    };
};
exports.getTaskById = getTaskById;
const createTask = async (taskData) => {
    const id = (0, uuid_1.v4)();
    const slug = await (0, slug_util_1.generateUniqueTaskSlug)(taskData.title);
    const reference_code = await Promise.resolve().then(() => __importStar(require('../utils/referenceCode.util'))).then(m => m.generateUniqueReferenceCode('task'));
    const result = await (0, database_1.query)(`
    INSERT INTO tasks (
      id, title, slug, description, category_id, difficulty, image, 
      reference_code, status, ip_address, user_agent, created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING', $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING *
  `, [
        id,
        taskData.title,
        slug,
        taskData.description,
        taskData.category,
        taskData.difficulty || 'medium',
        taskData.image,
        reference_code,
        taskData.ip_address,
        taskData.user_agent
    ]);
    return {
        task: result.rows[0],
        reference_code
    };
};
exports.createTask = createTask;
const updateTask = async (id, updates) => {
    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;
    for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined && key !== 'id' && key !== 'created_at') {
            paramCount++;
            updateFields.push(`${key} = $${paramCount}`);
            updateValues.push(value);
        }
    }
    if (updateFields.length === 0) {
        return null;
    }
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(id);
    const result = await (0, database_1.query)(`
    UPDATE tasks 
    SET ${updateFields.join(', ')} 
    WHERE id = $${paramCount + 1}
    RETURNING *
  `, updateValues);
    return result.rows[0] || null;
};
exports.updateTask = updateTask;
const deleteTask = async (id) => {
    const result = await (0, database_1.query)(`
    UPDATE tasks 
    SET status = 'REJECTED', updated_at = CURRENT_TIMESTAMP 
    WHERE id = $1
  `, [id]);
    return result.rowCount > 0;
};
exports.deleteTask = deleteTask;
const searchTasks = async (searchTerm, options = {}) => {
    const { category, limit = 20, page = 1 } = options;
    let whereClause = "WHERE t.status = 'ACCEPTED' AND to_tsvector('english', t.title || ' ' || t.description) @@ plainto_tsquery('english', $1)";
    let queryParams = [searchTerm];
    let paramCount = 1;
    if (category) {
        paramCount++;
        whereClause += ` AND c.slug = $${paramCount}`;
        queryParams.push(category);
    }
    const countQuery = `
    SELECT COUNT(*) as count
    FROM tasks t
    LEFT JOIN categories c ON t.category_id = c.id
    ${whereClause}
  `;
    const offset = (page - 1) * limit;
    const dataQuery = `
    SELECT 
      t.id,
      t.title,
      t.title_nepali,
      t.description,
      t.slug,
      t.difficulty,
      t.estimated_time,
      t.image,
      c.name as category_name,
      c.slug as category_slug,
      ts_rank(to_tsvector('english', t.title || ' ' || t.description), plainto_tsquery('english', $1)) as rank
    FROM tasks t
    LEFT JOIN categories c ON t.category_id = c.id
    ${whereClause}
    ORDER BY rank DESC, t.updated_at DESC
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
exports.searchTasks = searchTasks;
//# sourceMappingURL=task.model.js.map