"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const public_routes_1 = __importDefault(require("./public.routes"));
const admin_routes_1 = __importDefault(require("./admin.routes"));
const rateLimit_middleware_1 = require("../middleware/rateLimit.middleware");
const router = (0, express_1.Router)();
router.use(rateLimit_middleware_1.generalLimiter);
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
                task_detail: 'GET /api/tasks/:id',
                submit_task: 'POST /api/tasks',
                search: 'GET /api/search?q=query',
                categories: 'GET /api/categories',
                contribute_update: 'POST /api/contribute/update',
                check_status: 'GET /api/check-status?reference_code=XXX-XXXXX',
                contribution_categories: 'GET /api/contribution-categories',
            },
            admin: {
                login: 'POST /api/admin/auth/login',
                dashboard: 'GET /api/admin/dashboard',
                contributions: 'GET /api/admin/contributions',
                approve_contribution: 'PUT /api/admin/contributions/:id/approve',
                reject_contribution: 'PUT /api/admin/contributions/:id/reject',
            },
        },
    });
});
router.use('/api', public_routes_1.default);
router.use('/api/admin', admin_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map