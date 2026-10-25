"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const env_1 = require("./env");
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Sarkari Kaam API',
            version: '1.0.0',
            description: 'API documentation for Sarkari Kaam - Government Services Platform',
            contact: {
                name: 'Sarkari Kaam Team',
                email: 'sarkarikam@laevix.com',
            },
        },
        servers: [
            {
                url: `http://localhost:${env_1.env.PORT || 3001}`,
                description: 'Development server',
            },
            {
                url: 'https://api.sarkarikaam.com',
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token',
                },
            },
            schemas: {
                Task: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        slug: { type: 'string' },
                        difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
                        status: { type: 'string', enum: ['draft', 'published'] },
                        category_name: { type: 'string' },
                        category_slug: { type: 'string' },
                    },
                },
                Category: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        slug: { type: 'string' },
                        description: { type: 'string' },
                        task_count: { type: 'number' },
                    },
                },
                Contribution: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        reference_code: { type: 'string' },
                        contributor_name: { type: 'string' },
                        contributor_email: { type: 'string', format: 'email' },
                        contribution_type: { type: 'string', enum: ['new_task', 'edit_task', 'ground_reality', 'scam_warning'] },
                        status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        error: { type: 'string' },
                        code: { type: 'string' },
                    },
                },
                Success: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        data: { type: 'object' },
                        message: { type: 'string' },
                    },
                },
            },
            responses: {
                UnauthorizedError: {
                    description: 'Authentication token is missing or invalid',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error',
                            },
                        },
                    },
                },
                NotFoundError: {
                    description: 'Resource not found',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error',
                            },
                        },
                    },
                },
                ValidationError: {
                    description: 'Validation error',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: { type: 'boolean', example: false },
                                    errors: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                field: { type: 'string' },
                                                message: { type: 'string' },
                                                code: { type: 'string' },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
const setupSwagger = (app) => {
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Sarkari Kaam API Docs',
    }));
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
};
exports.setupSwagger = setupSwagger;
exports.default = swaggerSpec;
//# sourceMappingURL=swagger.js.map