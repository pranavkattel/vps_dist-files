"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3001'),
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/sarkari-kaam',
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || [
        'http://localhost:5173',
        'http://localhost:4173',
        'http://localhost:3000',
        'http://localhost:8080'
    ],
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '3600000', 10),
    RATE_LIMIT_MAX_CONTRIBUTION: parseInt(process.env.RATE_LIMIT_MAX_CONTRIBUTION || '10', 10),
    RATE_LIMIT_MAX_STATUS_CHECK: parseInt(process.env.RATE_LIMIT_MAX_STATUS_CHECK || '20', 10),
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
    UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
    IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
    IS_PRODUCTION: process.env.NODE_ENV === 'production',
};
exports.default = exports.env;
//# sourceMappingURL=env.js.map