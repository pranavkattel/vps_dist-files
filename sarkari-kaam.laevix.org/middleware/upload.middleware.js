"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupOnError = exports.validateUploadedFile = exports.handleFileUpload = void 0;
const storage_1 = require("../config/storage");
const response_util_1 = require("../utils/response.util");
const logger_util_1 = require("../utils/logger.util");
const handleFileUpload = (fieldName = 'image') => {
    return (req, res, next) => {
        const upload = (0, storage_1.uploadSingle)(fieldName);
        upload(req, res, (error) => {
            if (error) {
                logger_util_1.logger.error('File upload error:', error);
                (0, response_util_1.sendFileUploadError)(res, error.message);
                return;
            }
            next();
        });
    };
};
exports.handleFileUpload = handleFileUpload;
const validateUploadedFile = (required = false) => {
    return (req, res, next) => {
        const file = req.file;
        if (required && !file) {
            (0, response_util_1.sendFileUploadError)(res, 'Image file is required');
            return;
        }
        if (file) {
            logger_util_1.logger.info(`File uploaded: ${file.filename} (${file.size} bytes)`);
        }
        next();
    };
};
exports.validateUploadedFile = validateUploadedFile;
const cleanupOnError = (req, res, next) => {
    const originalSend = res.send;
    res.send = function (data) {
        if (res.statusCode >= 400 && req.file) {
            const fs = require('fs');
            const path = require('path');
            const filePath = req.file.path;
            if (fs.existsSync(filePath)) {
                fs.unlink(filePath, (err) => {
                    if (err) {
                        logger_util_1.logger.error('Failed to cleanup uploaded file:', err);
                    }
                    else {
                        logger_util_1.logger.info('Cleaned up uploaded file after error:', filePath);
                    }
                });
            }
        }
        return originalSend.call(this, data);
    };
    next();
};
exports.cleanupOnError = cleanupOnError;
//# sourceMappingURL=upload.middleware.js.map