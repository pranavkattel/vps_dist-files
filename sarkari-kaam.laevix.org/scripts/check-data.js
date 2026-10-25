"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("../config/mongodb");
const models_1 = require("../models");
const logger_util_1 = require("../utils/logger.util");
const verifyData = async () => {
    try {
        await (0, mongodb_1.connectDatabase)();
        const categoryCount = await models_1.Category.countDocuments();
        const taskCount = await models_1.Task.countDocuments();
        logger_util_1.logger.info(`📊 Database Verification Results:`);
        logger_util_1.logger.info(`--------------------------------`);
        logger_util_1.logger.info(`📂 Categories: ${categoryCount}`);
        if (categoryCount > 0) {
            const categories = await models_1.Category.find({});
            categories.forEach(c => logger_util_1.logger.info(`   - ${c.name} (${c.slug})`));
        }
        else {
            logger_util_1.logger.warn('⚠️ No categories found!');
        }
        logger_util_1.logger.info(`📝 Tasks: ${taskCount}`);
        await (0, mongodb_1.disconnectDatabase)();
    }
    catch (error) {
        logger_util_1.logger.error('❌ Verification failed:', error);
        process.exit(1);
    }
};
verifyData();
//# sourceMappingURL=check-data.js.map