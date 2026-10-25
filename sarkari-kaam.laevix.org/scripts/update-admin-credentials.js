"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("../config/mongodb");
const models_1 = require("../models");
const bcrypt_util_1 = require("../utils/bcrypt.util");
const logger_util_1 = require("../utils/logger.util");
async function updateAdminCredentials() {
    try {
        logger_util_1.logger.info('🔄 Updating admin credentials...');
        await (0, mongodb_1.connectDatabase)();
        let existingAdmin = await models_1.Admin.findOne({
            $or: [
                { email: 'admin@sarkarikaam.com' },
                { email: 'sarkarikam@laevix.com' },
                { username: 'admin' }
            ]
        });
        if (existingAdmin) {
            const newPasswordHash = await (0, bcrypt_util_1.hashPassword)('sarkari@123$');
            existingAdmin.email = 'sarkarikam@laevix.com';
            existingAdmin.password_hash = newPasswordHash;
            existingAdmin.updated_at = new Date();
            await existingAdmin.save();
            logger_util_1.logger.info('✅ Admin credentials updated successfully!');
            logger_util_1.logger.info(`📧 Updated email: sarkarikam@laevix.com`);
            logger_util_1.logger.info(`🔑 Updated password: sarkari@123$`);
        }
        else {
            const newPasswordHash = await (0, bcrypt_util_1.hashPassword)('sarkari@123$');
            const newAdmin = new models_1.Admin({
                username: 'admin',
                email: 'sarkarikam@laevix.com',
                password_hash: newPasswordHash,
                role: 'super_admin',
                is_active: true
            });
            await newAdmin.save();
            logger_util_1.logger.info('✅ New admin user created successfully!');
            logger_util_1.logger.info(`📧 Email: sarkarikam@laevix.com`);
            logger_util_1.logger.info(`🔑 Password: sarkari@123$`);
        }
    }
    catch (error) {
        logger_util_1.logger.error('❌ Failed to update admin credentials:', error);
        process.exit(1);
    }
    finally {
        await (0, mongodb_1.disconnectDatabase)();
        process.exit(0);
    }
}
updateAdminCredentials();
//# sourceMappingURL=update-admin-credentials.js.map