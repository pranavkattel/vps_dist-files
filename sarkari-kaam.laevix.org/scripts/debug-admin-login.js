"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("../config/mongodb");
const models_1 = require("../models");
const bcrypt_util_1 = require("../utils/bcrypt.util");
const logger_util_1 = require("../utils/logger.util");
async function debugAdminLogin() {
    try {
        logger_util_1.logger.info('🔍 Debugging admin login...');
        await (0, mongodb_1.connectDatabase)();
        const allAdmins = await models_1.Admin.find({});
        logger_util_1.logger.info(`Found ${allAdmins.length} admin users:`);
        allAdmins.forEach((admin, index) => {
            logger_util_1.logger.info(`Admin ${index + 1}:`);
            logger_util_1.logger.info(`  ID: ${admin._id}`);
            logger_util_1.logger.info(`  Username: ${admin.username}`);
            logger_util_1.logger.info(`  Email: ${admin.email}`);
            logger_util_1.logger.info(`  Role: ${admin.role}`);
            logger_util_1.logger.info(`  Is Active: ${admin.is_active}`);
            logger_util_1.logger.info(`  Password Hash: ${admin.password_hash.substring(0, 20)}...`);
        });
        const testEmail = 'sarkarikam@laevix.com';
        const testPassword = 'sarkari@123$';
        logger_util_1.logger.info(`\n🧪 Testing login for: ${testEmail}`);
        const admin = await models_1.Admin.findOne({ email: testEmail, is_active: true });
        if (!admin) {
            logger_util_1.logger.error('❌ Admin not found or not active');
            return;
        }
        logger_util_1.logger.info(`✅ Admin found: ${admin.email}`);
        const isValidPassword = await (0, bcrypt_util_1.verifyPassword)(testPassword, admin.password_hash);
        logger_util_1.logger.info(`🔑 Password verification: ${isValidPassword ? 'SUCCESS' : 'FAILED'}`);
        if (!isValidPassword) {
            logger_util_1.logger.error('❌ Password does not match');
        }
        else {
            logger_util_1.logger.info('✅ Password matches!');
        }
    }
    catch (error) {
        logger_util_1.logger.error('❌ Debug failed:', error);
    }
    finally {
        await (0, mongodb_1.disconnectDatabase)();
        process.exit(0);
    }
}
debugAdminLogin();
//# sourceMappingURL=debug-admin-login.js.map