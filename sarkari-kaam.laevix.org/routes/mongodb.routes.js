"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Task_1 = require("../models/Task");
const Category_1 = require("../models/Category");
const Contribution_1 = require("../models/Contribution");
const Admin_1 = require("../models/Admin");
const bcrypt_util_1 = require("../utils/bcrypt.util");
const jwt_util_1 = require("../utils/jwt.util");
const storage_1 = require("../config/storage");
const router = (0, express_1.Router)();
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Sarkari Kaam API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
    });
});
router.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'Sarkari Kaam API v1.0.0',
        documentation: '/api/docs',
        endpoints: {
            public: {
                tasks: 'GET /api/tasks',
                task_detail: 'GET /api/tasks/:slug',
                categories: 'GET /api/categories',
                submit_task: 'POST /api/tasks',
                search: 'GET /api/search',
                check_status: 'GET /api/check-status',
            },
            admin: {
                login: 'POST /api/admin/auth/login',
                tasks: 'GET /api/admin/tasks',
                contributions: 'GET /api/admin/contributions',
                statistics: 'GET /api/admin/statistics',
            },
        },
    });
});
router.get('/api/tasks', async (req, res) => {
    try {
        const { category, difficulty, search, status = 'published', page = 1, limit = 20 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = Math.min(parseInt(limit), 100);
        const skip = (pageNum - 1) * limitNum;
        const filter = {};
        if (category && category !== 'all') {
            filter.category_slug = category;
        }
        if (difficulty && difficulty !== 'all') {
            filter.difficulty = difficulty;
        }
        if (status && status !== 'all') {
            filter.status = status;
        }
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            filter.$or = [
                { title: searchRegex },
                { description: searchRegex },
                { 'overview.content': searchRegex },
                { category_name: searchRegex }
            ];
        }
        const [tasks, totalCount] = await Promise.all([
            Task_1.Task.find(filter)
                .select('title slug description category_name category_slug difficulty status overview estimated_time created_at updated_at view_count cover_image')
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(limitNum)
                .exec(),
            Task_1.Task.countDocuments(filter)
        ]);
        const totalPages = Math.ceil(totalCount / limitNum);
        res.json({
            success: true,
            data: {
                tasks: tasks.map(task => ({
                    id: task._id,
                    title: task.title,
                    slug: task.slug,
                    description: task.description,
                    category: task.category_name,
                    category_name: task.category_name,
                    category_slug: task.category_slug,
                    difficulty: task.difficulty,
                    status: task.status,
                    overview: task.overview,
                    estimated_time: task.estimated_time,
                    view_count: task.view_count || 0,
                    image: task.cover_image || '',
                    created_at: task.created_at,
                    updated_at: task.updated_at
                })),
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalCount,
                    limit: limitNum,
                    hasNext: pageNum < totalPages,
                    hasPrev: pageNum > 1
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tasks',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/api/tasks/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const task = await Task_1.Task.findOne({ slug }).exec();
        if (!task) {
            res.status(404).json({
                success: false,
                message: 'Task not found'
            });
            return;
        }
        res.json({
            success: true,
            data: {
                id: task._id,
                _id: task._id,
                title: task.title,
                slug: task.slug,
                description: task.description,
                category: task.category_name,
                category_id: task.category_id,
                category_name: task.category_name,
                category_slug: task.category_slug,
                difficulty: task.difficulty,
                status: task.status,
                estimated_time: task.estimated_time,
                view_count: task.view_count,
                verified: task.verified,
                image: task.cover_image || '',
                overview: task.overview,
                steps: task.steps,
                documents: (task.documents || []).map((doc) => ({
                    ...doc.toObject ? doc.toObject() : doc,
                    sample_image: doc.sample_image ? (0, storage_1.getFileUrl)(doc.sample_image, 'documents') : ''
                })),
                ground_reality: (task.ground_reality || []).map((gr) => ({
                    ...gr.toObject ? gr.toObject() : gr,
                    image: gr.image ? (0, storage_1.getFileUrl)(gr.image, 'ground_reality') : ''
                })),
                scam_warnings: (task.scam_warnings || []).map((sw) => ({
                    ...sw.toObject ? sw.toObject() : sw,
                    image: sw.image ? (0, storage_1.getFileUrl)(sw.image, 'scam_warnings') : ''
                })),
                total_documents: task.total_documents,
                completed_documents: task.completed_documents,
                progress_percentage: task.progress_percentage,
                createdAt: task.created_at,
                updatedAt: task.updated_at
            }
        });
    }
    catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch task',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category_1.Category.find({})
            .select('name slug description icon color')
            .sort({ name: 1 })
            .exec();
        res.json({
            success: true,
            data: categories.map(cat => ({
                id: cat._id,
                _id: cat._id,
                name: cat.name,
                slug: cat.slug,
                description: cat.description,
                icon: cat.icon,
                color: cat.color
            }))
        });
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/api/tasks', async (req, res) => {
    try {
        const taskData = req.body;
        const task = new Task_1.Task(taskData);
        const savedTask = await task.save();
        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: {
                id: savedTask._id,
                title: savedTask.title,
                slug: savedTask.slug
            }
        });
    }
    catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create task',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/api/search', async (req, res) => {
    try {
        const { q, category, limit = 10 } = req.query;
        if (!q) {
            res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
            return;
        }
        const searchRegex = new RegExp(q, 'i');
        const filter = {
            status: 'active',
            $or: [
                { title: searchRegex },
                { description: searchRegex },
                { 'overview.summary': searchRegex }
            ]
        };
        if (category && category !== 'all') {
            filter.category_name = category;
        }
        const tasks = await Task_1.Task.find(filter)
            .select('title slug description category_name difficulty overview')
            .limit(parseInt(limit))
            .sort({ created_at: -1 })
            .exec();
        res.json({
            success: true,
            data: tasks.map(task => ({
                id: task._id,
                title: task.title,
                slug: task.slug,
                description: task.description,
                category: task.category_name,
                difficulty: task.difficulty,
                overview: task.overview
            }))
        });
    }
    catch (error) {
        console.error('Error searching tasks:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search tasks',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/api/check-status', async (req, res) => {
    try {
        const { reference_code } = req.query;
        if (!reference_code) {
            res.status(400).json({
                success: false,
                message: 'Reference code is required'
            });
            return;
        }
        res.json({
            success: true,
            data: {
                reference_code,
                status: 'pending',
                message: 'Status checking functionality not yet implemented',
                last_updated: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error('Error checking status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check status',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/api/admin/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin_1.Admin.findOne({ email, is_active: true });
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        const isValidPassword = await (0, bcrypt_util_1.verifyPassword)(password, admin.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        const tokenPayload = {
            id: admin._id.toString(),
            email: admin.email,
            role: admin.role,
            username: admin.username
        };
        const token = (0, jwt_util_1.generateToken)(tokenPayload);
        admin.last_login = new Date();
        await admin.save();
        return res.json({
            success: true,
            data: {
                token,
                admin: {
                    id: admin._id,
                    username: admin.username,
                    email: admin.email,
                    role: admin.role,
                    last_login: admin.last_login,
                },
            },
            message: 'Login successful'
        });
    }
    catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.post('/api/admin/tasks', async (req, res) => {
    try {
        const taskData = req.body;
        const existingTask = await Task_1.Task.findOne({ slug: taskData.slug });
        if (existingTask) {
            res.status(400).json({
                success: false,
                message: 'A task with this slug already exists'
            });
            return;
        }
        const newTask = new Task_1.Task({
            ...taskData,
            view_count: 0,
            verified: false,
            created_at: new Date(),
            updated_at: new Date()
        });
        await newTask.save();
        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: newTask
        });
    }
    catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create task',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.put('/api/admin/tasks/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const taskData = req.body;
        console.log('Update task - documents received:', JSON.stringify(taskData.documents?.slice(0, 2), null, 2));
        const task = await Task_1.Task.findOne({ slug });
        if (!task) {
            res.status(404).json({
                success: false,
                message: 'Task not found'
            });
            return;
        }
        if (taskData.slug && taskData.slug !== slug) {
            const existingTask = await Task_1.Task.findOne({ slug: taskData.slug });
            if (existingTask) {
                res.status(400).json({
                    success: false,
                    message: 'A task with this slug already exists'
                });
                return;
            }
        }
        if (taskData.category_id) {
            const category = await Category_1.Category.findById(taskData.category_id);
            if (category) {
                taskData.category_name = category.name;
                taskData.category_slug = category.slug;
            }
        }
        if (!taskData.category_name && task.category_name) {
            taskData.category_name = task.category_name;
        }
        if (!taskData.category_slug && task.category_slug) {
            taskData.category_slug = task.category_slug;
        }
        if (!taskData.category_id && task.category_id) {
            taskData.category_id = task.category_id;
        }
        Object.assign(task, {
            ...taskData,
            updated_at: new Date()
        });
        await task.save();
        res.json({
            success: true,
            message: 'Task updated successfully',
            data: task
        });
    }
    catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update task',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.delete('/api/admin/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let task = await Task_1.Task.findById(id).catch(() => null);
        if (!task) {
            task = await Task_1.Task.findOne({ slug: id });
        }
        if (!task) {
            res.status(404).json({
                success: false,
                message: 'Task not found'
            });
            return;
        }
        await Task_1.Task.deleteOne({ _id: task._id });
        res.json({
            success: true,
            message: 'Task deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete task',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/api/admin/categories', async (req, res) => {
    try {
        const categoryData = req.body;
        const existingCategory = await Category_1.Category.findOne({ slug: categoryData.slug });
        if (existingCategory) {
            res.status(400).json({
                success: false,
                message: 'A category with this slug already exists'
            });
            return;
        }
        const newCategory = new Category_1.Category({
            ...categoryData,
            task_count: 0,
            created_at: new Date(),
            updated_at: new Date()
        });
        await newCategory.save();
        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: newCategory
        });
    }
    catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create category',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.put('/api/admin/categories/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const categoryData = req.body;
        const category = await Category_1.Category.findOne({ slug });
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        Object.assign(category, {
            ...categoryData,
            updated_at: new Date()
        });
        await category.save();
        return res.json({
            success: true,
            message: 'Category updated successfully',
            data: category
        });
    }
    catch (error) {
        console.error('Error updating category:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update category',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.delete('/api/admin/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let category = await Category_1.Category.findById(id).catch(() => null);
        if (!category) {
            category = await Category_1.Category.findOne({ slug: id });
        }
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        const tasksCount = await Task_1.Task.countDocuments({ category_id: category._id });
        if (tasksCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category. ${tasksCount} tasks are using this category.`
            });
        }
        await Category_1.Category.deleteOne({ _id: category._id });
        return res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting category:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete category',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/api/admin/upload', (req, res, next) => {
    (0, storage_1.uploadSingle)('image')(req, res, (err) => {
        if (err) {
            console.error('Multer error:', err);
            res.status(400).json({
                success: false,
                message: err.message || 'File upload error'
            });
            return;
        }
        next();
    });
}, async (req, res) => {
    try {
        console.log('Upload request received');
        console.log('File:', req.file);
        console.log('Query:', req.query);
        if (!req.file) {
            res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
            return;
        }
        const uploadType = req.query.type || 'misc';
        const imageUrl = (0, storage_1.getFileUrl)(req.file.filename, uploadType);
        console.log('Upload successful:', imageUrl);
        res.json({
            success: true,
            message: 'File uploaded successfully',
            data: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                url: imageUrl,
                size: req.file.size,
                mimetype: req.file.mimetype
            }
        });
    }
    catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload file',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
function generateReferenceCode() {
    const prefix = 'CONTRIB';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
}
router.post('/api/contributions/upload-image', (req, res, next) => {
    (0, storage_1.uploadSingle)('image')(req, res, (err) => {
        if (err) {
            res.status(400).json({
                success: false,
                message: err.message || 'Failed to upload image'
            });
            return;
        }
        next();
    });
}, async (req, res) => {
    try {
        const file = req.file;
        const type = req.query.type || 'contributions';
        if (!file) {
            res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
            return;
        }
        const validTypes = ['documents', 'ground_reality', 'scam_warnings', 'contributions'];
        const uploadType = validTypes.includes(type) ? type : 'contributions';
        const imageUrl = (0, storage_1.getFileUrl)(file.filename, uploadType);
        res.json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                url: imageUrl,
                filename: file.filename,
                type: uploadType
            }
        });
    }
    catch (error) {
        console.error('Error uploading contribution image:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload image'
        });
    }
});
router.post('/api/contributions', async (req, res) => {
    try {
        const { contribution_type, task_slug, contributor_name, contributor_email, contributor_note, proposed_data } = req.body;
        if (!contribution_type || !['new_task', 'edit_task'].includes(contribution_type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid contribution type. Must be "new_task" or "edit_task"'
            });
        }
        if (!contributor_name || contributor_name.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Contributor name is required'
            });
        }
        if (!proposed_data) {
            return res.status(400).json({
                success: false,
                message: 'Proposed data is required'
            });
        }
        let original_data = null;
        let task_title = null;
        if (contribution_type === 'edit_task') {
            if (!task_slug) {
                return res.status(400).json({
                    success: false,
                    message: 'Task slug is required for editing an existing task'
                });
            }
            const existingTask = await Task_1.Task.findOne({ slug: task_slug });
            if (!existingTask) {
                return res.status(404).json({
                    success: false,
                    message: 'Task not found'
                });
            }
            task_title = existingTask.title;
            original_data = {
                title: existingTask.title,
                description: existingTask.description,
                slug: existingTask.slug,
                difficulty: existingTask.difficulty,
                category_id: existingTask.category_id?.toString(),
                category_name: existingTask.category_name,
                category_slug: existingTask.category_slug,
                status: existingTask.status,
                estimated_time: existingTask.estimated_time,
                overview: existingTask.overview,
                steps: existingTask.steps,
                documents: existingTask.documents,
                ground_reality: existingTask.ground_reality,
                scam_warnings: existingTask.scam_warnings
            };
        }
        const reference_code = generateReferenceCode();
        const contribution = new Contribution_1.Contribution({
            reference_code,
            contribution_type,
            task_slug: task_slug || null,
            task_title: task_title || proposed_data.title,
            contributor_name: contributor_name.trim(),
            contributor_email: contributor_email?.trim() || null,
            contributor_note: contributor_note?.trim() || null,
            proposed_data,
            original_data,
            status: 'pending'
        });
        await contribution.save();
        return res.status(201).json({
            success: true,
            message: 'Contribution submitted successfully',
            data: {
                reference_code,
                contribution_type,
                status: 'pending',
                task_title: contribution.task_title
            }
        });
    }
    catch (error) {
        console.error('Error submitting contribution:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to submit contribution',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/api/contributions/status/:referenceCode', async (req, res) => {
    try {
        const { referenceCode } = req.params;
        const contribution = await Contribution_1.Contribution.findOne({
            reference_code: referenceCode.toUpperCase()
        });
        if (!contribution) {
            return res.status(404).json({
                success: false,
                message: 'Contribution not found. Please check your reference code.'
            });
        }
        return res.json({
            success: true,
            data: {
                reference_code: contribution.reference_code,
                contribution_type: contribution.contribution_type,
                task_title: contribution.task_title,
                status: contribution.status,
                admin_note: contribution.status !== 'pending' ? contribution.admin_note : null,
                submitted_at: contribution.created_at,
                reviewed_at: contribution.reviewed_at
            }
        });
    }
    catch (error) {
        console.error('Error checking contribution status:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to check contribution status',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/api/admin/contributions', async (req, res) => {
    try {
        const { status, contribution_type, page = 1, limit = 20 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = Math.min(parseInt(limit), 100);
        const skip = (pageNum - 1) * limitNum;
        const filter = {};
        if (status && status !== 'all') {
            filter.status = status;
        }
        if (contribution_type && contribution_type !== 'all') {
            filter.contribution_type = contribution_type;
        }
        const [contributions, totalCount] = await Promise.all([
            Contribution_1.Contribution.find(filter)
                .select('reference_code contribution_type task_slug task_title contributor_name status created_at reviewed_at')
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(limitNum)
                .exec(),
            Contribution_1.Contribution.countDocuments(filter)
        ]);
        const totalPages = Math.ceil(totalCount / limitNum);
        res.json({
            success: true,
            data: {
                contributions: contributions.map(c => ({
                    id: c._id,
                    reference_code: c.reference_code,
                    contribution_type: c.contribution_type,
                    task_slug: c.task_slug,
                    task_title: c.task_title,
                    contributor_name: c.contributor_name,
                    status: c.status,
                    created_at: c.created_at,
                    reviewed_at: c.reviewed_at
                })),
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    totalCount,
                    limit: limitNum,
                    hasNext: pageNum < totalPages,
                    hasPrev: pageNum > 1
                },
                stats: {
                    pending: await Contribution_1.Contribution.countDocuments({ status: 'pending' }),
                    approved: await Contribution_1.Contribution.countDocuments({ status: 'approved' }),
                    rejected: await Contribution_1.Contribution.countDocuments({ status: 'rejected' })
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching contributions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch contributions',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/api/admin/contributions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const contribution = await Contribution_1.Contribution.findById(id);
        if (!contribution) {
            res.status(404).json({
                success: false,
                message: 'Contribution not found'
            });
            return;
        }
        res.json({
            success: true,
            data: {
                id: contribution._id,
                reference_code: contribution.reference_code,
                contribution_type: contribution.contribution_type,
                task_slug: contribution.task_slug,
                task_title: contribution.task_title,
                contributor_name: contribution.contributor_name,
                contributor_email: contribution.contributor_email,
                contributor_note: contribution.contributor_note,
                proposed_data: contribution.proposed_data,
                original_data: contribution.original_data,
                status: contribution.status,
                admin_note: contribution.admin_note,
                reviewed_by: contribution.reviewed_by,
                reviewed_at: contribution.reviewed_at,
                created_at: contribution.created_at,
                updated_at: contribution.updated_at
            }
        });
    }
    catch (error) {
        console.error('Error fetching contribution:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch contribution',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/api/admin/contributions/:id/approve', (0, storage_1.uploadSingle)('cover_image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { admin_note, reviewed_by = 'Admin' } = req.body;
        const coverImageFile = req.file;
        const contribution = await Contribution_1.Contribution.findById(id);
        if (!contribution) {
            res.status(404).json({
                success: false,
                message: 'Contribution not found'
            });
            return;
        }
        if (contribution.status !== 'pending') {
            res.status(400).json({
                success: false,
                message: `Contribution has already been ${contribution.status}`
            });
            return;
        }
        if (contribution.contribution_type === 'new_task') {
            const taskData = contribution.proposed_data;
            if (!coverImageFile) {
                res.status(400).json({
                    success: false,
                    message: 'A cover photo is required when approving a new task. Please upload an image.'
                });
                return;
            }
            const missingFields = [];
            if (!taskData.title)
                missingFields.push('title');
            if (!taskData.description)
                missingFields.push('description');
            if (!taskData.slug)
                missingFields.push('slug');
            if (!taskData.category_id)
                missingFields.push('category_id');
            if (!taskData.estimated_time)
                missingFields.push('estimated_time');
            if (missingFields.length > 0) {
                res.status(400).json({
                    success: false,
                    message: `Contribution is missing required fields: ${missingFields.join(', ')}. Please reject and ask contributor to provide complete information.`
                });
                return;
            }
            if (req.body.slug_override) {
                taskData.slug = req.body.slug_override;
            }
            const existingTask = await Task_1.Task.findOne({ slug: taskData.slug });
            if (existingTask) {
                res.status(409).json({
                    success: false,
                    code: 'SLUG_EXISTS',
                    message: 'A task with this slug already exists. Please edit the slug below and try again.',
                    current_slug: taskData.slug
                });
                return;
            }
            const category = await Category_1.Category.findById(taskData.category_id);
            if (!category) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid category_id. Category not found.'
                });
                return;
            }
            taskData.category_name = category.name;
            taskData.category_slug = category.slug;
            const newTask = new Task_1.Task({
                title: taskData.title,
                description: taskData.description,
                slug: taskData.slug,
                difficulty: taskData.difficulty || 'medium',
                category_id: taskData.category_id,
                category_name: taskData.category_name,
                category_slug: taskData.category_slug,
                estimated_time: taskData.estimated_time,
                cover_image: coverImageFile ? (0, storage_1.getFileUrl)(coverImageFile.filename, 'tasks') : '',
                overview: taskData.overview || { content: '' },
                steps: taskData.steps || [],
                documents: taskData.documents || [],
                ground_reality: taskData.ground_reality || [],
                scam_warnings: taskData.scam_warnings || [],
                status: 'published',
                view_count: 0,
                verified: false,
                created_at: new Date(),
                updated_at: new Date()
            });
            await newTask.save();
        }
        else if (contribution.contribution_type === 'edit_task') {
            const taskSlug = contribution.task_slug;
            if (!taskSlug) {
                res.status(400).json({
                    success: false,
                    message: 'Edit contribution must reference an existing task'
                });
                return;
            }
            const task = await Task_1.Task.findOne({ slug: taskSlug });
            if (!task) {
                res.status(404).json({
                    success: false,
                    message: 'Original task no longer exists'
                });
                return;
            }
            const taskData = contribution.proposed_data;
            if (taskData.steps && taskData.steps.length > 0) {
                task.steps = taskData.steps;
            }
            if (taskData.documents && taskData.documents.length > 0) {
                task.documents = taskData.documents;
            }
            if (taskData.ground_reality && taskData.ground_reality.length > 0) {
                if (!task.ground_reality)
                    task.ground_reality = [];
                task.ground_reality = [...task.ground_reality, ...taskData.ground_reality];
            }
            if (taskData.scam_warnings && taskData.scam_warnings.length > 0) {
                if (!task.scam_warnings)
                    task.scam_warnings = [];
                task.scam_warnings = [...task.scam_warnings, ...taskData.scam_warnings];
            }
            if (coverImageFile) {
                task.cover_image = (0, storage_1.getFileUrl)(coverImageFile.filename, 'tasks');
            }
            task.updated_at = new Date();
            await task.save();
        }
        contribution.status = 'approved';
        contribution.admin_note = admin_note;
        contribution.reviewed_by = reviewed_by;
        contribution.reviewed_at = new Date();
        await contribution.save();
        res.json({
            success: true,
            message: `Contribution approved and ${contribution.contribution_type === 'new_task' ? 'new task created' : 'task updated'} successfully`,
            data: {
                reference_code: contribution.reference_code,
                status: 'approved'
            }
        });
    }
    catch (error) {
        console.error('Error approving contribution:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve contribution',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/api/admin/contributions/:id/reject', async (req, res) => {
    try {
        const { id } = req.params;
        const { admin_note, reviewed_by = 'Admin' } = req.body;
        const contribution = await Contribution_1.Contribution.findById(id);
        if (!contribution) {
            res.status(404).json({
                success: false,
                message: 'Contribution not found'
            });
            return;
        }
        if (contribution.status !== 'pending') {
            res.status(400).json({
                success: false,
                message: `Contribution has already been ${contribution.status}`
            });
            return;
        }
        contribution.status = 'rejected';
        contribution.admin_note = admin_note || 'Rejected by admin';
        contribution.reviewed_by = reviewed_by;
        contribution.reviewed_at = new Date();
        await contribution.save();
        res.json({
            success: true,
            message: 'Contribution rejected',
            data: {
                reference_code: contribution.reference_code,
                status: 'rejected'
            }
        });
    }
    catch (error) {
        console.error('Error rejecting contribution:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject contribution',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=mongodb.routes.js.map