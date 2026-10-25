"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategoryBySlug = exports.getCategoryById = exports.getAllCategories = void 0;
const database_1 = require("../config/database");
const slug_util_1 = require("../utils/slug.util");
const uuid_1 = require("uuid");
const getAllCategories = async () => {
    const result = await (0, database_1.query)(`
    SELECT 
      c.*,
      COUNT(t.id) as task_count
    FROM categories c
    LEFT JOIN tasks t ON c.id = t.category_id AND t.status = 'ACCEPTED'
    GROUP BY c.id
    ORDER BY c.display_order ASC, c.name ASC
  `);
    return result.rows.map((row) => ({
        ...row,
        task_count: parseInt(row.task_count || 0)
    }));
};
exports.getAllCategories = getAllCategories;
const getCategoryById = async (id) => {
    const result = await (0, database_1.query)(`
    SELECT 
      c.*,
      COUNT(t.id) as task_count
    FROM categories c
    LEFT JOIN tasks t ON c.id = t.category_id AND t.status = 'ACCEPTED'
    WHERE c.id = $1
    GROUP BY c.id
  `, [id]);
    if (result.rows.length === 0) {
        return null;
    }
    const row = result.rows[0];
    return {
        ...row,
        task_count: parseInt(row.task_count || 0)
    };
};
exports.getCategoryById = getCategoryById;
const getCategoryBySlug = async (slug) => {
    const result = await (0, database_1.query)(`
    SELECT 
      c.*,
      COUNT(t.id) as task_count
    FROM categories c
    LEFT JOIN tasks t ON c.id = t.category_id AND t.status = 'ACCEPTED'
    WHERE c.slug = $1
    GROUP BY c.id
  `, [slug]);
    if (result.rows.length === 0) {
        return null;
    }
    const row = result.rows[0];
    return {
        ...row,
        task_count: parseInt(row.task_count || 0)
    };
};
exports.getCategoryBySlug = getCategoryBySlug;
const createCategory = async (categoryData) => {
    const id = (0, uuid_1.v4)();
    const slug = await (0, slug_util_1.generateUniqueCategorySlug)(categoryData.name);
    const result = await (0, database_1.query)(`
    INSERT INTO categories (
      id, name, name_nepali, slug, description, icon_url, display_order, created_at, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING *
  `, [
        id,
        categoryData.name,
        categoryData.name_nepali,
        slug,
        categoryData.description,
        categoryData.icon_url,
        categoryData.display_order || 0
    ]);
    return { ...result.rows[0], task_count: 0 };
};
exports.createCategory = createCategory;
const updateCategory = async (id, updates) => {
    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;
    for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined && key !== 'id' && key !== 'created_at' && key !== 'task_count') {
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
    UPDATE categories 
    SET ${updateFields.join(', ')} 
    WHERE id = $${paramCount + 1}
    RETURNING *
  `, updateValues);
    if (result.rows.length === 0) {
        return null;
    }
    const category = await (0, exports.getCategoryById)(id);
    return category;
};
exports.updateCategory = updateCategory;
const deleteCategory = async (id) => {
    const taskCount = await (0, database_1.query)('SELECT COUNT(*) as count FROM tasks WHERE category_id = $1', [id]);
    if (parseInt(taskCount.rows[0].count) > 0) {
        throw new Error('Cannot delete category with existing tasks');
    }
    const result = await (0, database_1.query)('DELETE FROM categories WHERE id = $1', [id]);
    return result.rowCount > 0;
};
exports.deleteCategory = deleteCategory;
//# sourceMappingURL=category.model.js.map