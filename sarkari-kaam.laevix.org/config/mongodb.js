"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDatabase = exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
const logger_util_1 = require("../utils/logger.util");
const connectDatabase = async () => {
    try {
        const conn = await mongoose_1.default.connect(env_1.env.MONGODB_URI);
        logger_util_1.logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        logger_util_1.logger.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
};
exports.connectDatabase = connectDatabase;
const disconnectDatabase = async () => {
    try {
        await mongoose_1.default.disconnect();
        logger_util_1.logger.info('✅ MongoDB Disconnected');
    }
    catch (error) {
        logger_util_1.logger.error('❌ MongoDB Disconnection Error:', error);
    }
};
exports.disconnectDatabase = disconnectDatabase;
mongoose_1.default.connection.on('connected', () => {
    logger_util_1.logger.info('🔗 Mongoose connected to MongoDB');
});
mongoose_1.default.connection.on('error', (err) => {
    logger_util_1.logger.error('🚨 Mongoose connection error:', err);
});
mongoose_1.default.connection.on('disconnected', () => {
    logger_util_1.logger.info('🔌 Mongoose disconnected');
});
process.on('SIGINT', async () => {
    await mongoose_1.default.connection.close();
    logger_util_1.logger.info('🛑 MongoDB connection closed through app termination');
    process.exit(0);
});
exports.default = mongoose_1.default;
//# sourceMappingURL=mongodb.js.map