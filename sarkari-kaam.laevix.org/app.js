"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const env_1 = require("./config/env");
const logger_util_1 = require("./utils/logger.util");
const storage_1 = require("./config/storage");
const swagger_1 = require("./config/swagger");
const mongodb_routes_1 = __importDefault(require("./routes/mongodb.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const app = (0, express_1.default)();
app.set('trust proxy', 1);
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
app.use((0, cors_1.default)({
    origin: env_1.env.ALLOWED_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
    ],
}));
if (env_1.env.IS_DEVELOPMENT) {
    app.use((0, morgan_1.default)('dev', { stream: logger_util_1.morganStream }));
}
else {
    app.use((0, morgan_1.default)('combined', { stream: logger_util_1.morganStream }));
}
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
(0, swagger_1.setupSwagger)(app);
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Sarkari Kaam API Server is running! 🇺🇵',
        version: '1.0.0',
        environment: env_1.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        endpoints: {
            api_info: '/api',
            health_check: '/health',
            documentation: '/api-docs',
        },
    });
});
app.use('/', mongodb_routes_1.default);
app.use(error_middleware_1.notFoundHandler);
app.use(error_middleware_1.errorHandler);
(0, storage_1.initStorage)();
logger_util_1.logger.info('Express app configured successfully', {
    environment: env_1.env.NODE_ENV,
    allowedOrigins: env_1.env.ALLOWED_ORIGINS,
    uploadDir: env_1.env.UPLOAD_DIR,
});
exports.default = app;
//# sourceMappingURL=app.js.map