"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const mongodb_1 = require("./config/mongodb");
const logger_util_1 = require("./utils/logger.util");
async function startServer() {
    try {
        await (0, mongodb_1.connectDatabase)();
        logger_util_1.logger.info('MongoDB connection successful');
        const server = app_1.default.listen(env_1.env.PORT || 3000, () => {
            logger_util_1.logger.info(`Server is running on port ${env_1.env.PORT || 3000}`, {
                environment: env_1.env.NODE_ENV,
                port: env_1.env.PORT || 3000,
                pid: process.pid,
                nodeVersion: process.version,
            });
            if (env_1.env.IS_DEVELOPMENT) {
                logger_util_1.logger.info('Available endpoints:');
                logger_util_1.logger.info(`  Health Check: http://localhost:${env_1.env.PORT}/health`);
                logger_util_1.logger.info(`  API Info: http://localhost:${env_1.env.PORT}/api`);
                logger_util_1.logger.info(`  Tasks: http://localhost:${env_1.env.PORT}/api/tasks`);
                logger_util_1.logger.info(`  Admin Login: http://localhost:${env_1.env.PORT}/api/admin/auth/login`);
                logger_util_1.logger.info(`  Status Check: http://localhost:${env_1.env.PORT}/api/check-status?reference_code=XXX-XXXXX`);
            }
        });
        const gracefulShutdown = (signal) => {
            logger_util_1.logger.info(`Received ${signal}, starting graceful shutdown...`);
            server.close(async () => {
                logger_util_1.logger.info('HTTP server closed');
                try {
                    const mongoose = require('mongoose');
                    await mongoose.connection.close();
                    logger_util_1.logger.info('MongoDB connection closed');
                }
                catch (error) {
                    logger_util_1.logger.error('Error closing MongoDB connection:', error);
                }
                logger_util_1.logger.info('Graceful shutdown completed');
                process.exit(0);
            });
        };
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('uncaughtException', (error) => {
            logger_util_1.logger.error('Uncaught Exception:', error);
            process.exit(1);
        });
        process.on('unhandledRejection', (reason, promise) => {
            logger_util_1.logger.error('Unhandled Promise Rejection:', {
                reason,
                promise,
            });
            process.exit(1);
        });
        return server;
    }
    catch (error) {
        logger_util_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
}
if (require.main === module) {
    startServer();
}
exports.default = startServer;
//# sourceMappingURL=server.js.map