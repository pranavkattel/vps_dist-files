"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFile = exports.validateMultiple = exports.validateParams = exports.validateQuery = exports.validateBody = exports.validate = void 0;
const zod_1 = require("zod");
const response_util_1 = require("../utils/response.util");
const logger_util_1 = require("../utils/logger.util");
const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        try {
            const dataToValidate = req[source];
            const validatedData = schema.parse(dataToValidate);
            req[source] = validatedData;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                    code: err.code,
                }));
                logger_util_1.logger.debug('Validation error:', errors);
                (0, response_util_1.sendValidationError)(res, errors, 'Invalid input data');
                return;
            }
            logger_util_1.logger.error('Unexpected validation error:', error);
            (0, response_util_1.sendValidationError)(res, [], 'Validation failed');
        }
    };
};
exports.validate = validate;
const validateBody = (schema) => (0, exports.validate)(schema, 'body');
exports.validateBody = validateBody;
const validateQuery = (schema) => (0, exports.validate)(schema, 'query');
exports.validateQuery = validateQuery;
const validateParams = (schema) => (0, exports.validate)(schema, 'params');
exports.validateParams = validateParams;
const validateMultiple = (schemas) => {
    return (req, res, next) => {
        try {
            const errors = [];
            if (schemas.body) {
                try {
                    req.body = schemas.body.parse(req.body);
                }
                catch (error) {
                    if (error instanceof zod_1.ZodError) {
                        errors.push(...error.errors.map(err => ({
                            field: `body.${err.path.join('.')}`,
                            message: err.message,
                            code: err.code,
                        })));
                    }
                }
            }
            if (schemas.query) {
                try {
                    req.query = schemas.query.parse(req.query);
                }
                catch (error) {
                    if (error instanceof zod_1.ZodError) {
                        errors.push(...error.errors.map(err => ({
                            field: `query.${err.path.join('.')}`,
                            message: err.message,
                            code: err.code,
                        })));
                    }
                }
            }
            if (schemas.params) {
                try {
                    req.params = schemas.params.parse(req.params);
                }
                catch (error) {
                    if (error instanceof zod_1.ZodError) {
                        errors.push(...error.errors.map(err => ({
                            field: `params.${err.path.join('.')}`,
                            message: err.message,
                            code: err.code,
                        })));
                    }
                }
            }
            if (errors.length > 0) {
                logger_util_1.logger.debug('Validation errors:', errors);
                (0, response_util_1.sendValidationError)(res, errors, 'Invalid input data');
                return;
            }
            next();
        }
        catch (error) {
            logger_util_1.logger.error('Unexpected validation error:', error);
            (0, response_util_1.sendValidationError)(res, [], 'Validation failed');
        }
    };
};
exports.validateMultiple = validateMultiple;
const validateFile = (required = false) => {
    return (req, res, next) => {
        try {
            const file = req.file;
            if (required && !file) {
                (0, response_util_1.sendValidationError)(res, [{
                        field: 'image',
                        message: 'Image file is required',
                        code: 'required'
                    }]);
                return;
            }
            if (file) {
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                if (!allowedTypes.includes(file.mimetype)) {
                    (0, response_util_1.sendValidationError)(res, [{
                            field: 'image',
                            message: 'Only image files are allowed (jpeg, jpg, png, webp)',
                            code: 'invalid_type'
                        }]);
                    return;
                }
                const maxSize = 5 * 1024 * 1024;
                if (file.size > maxSize) {
                    (0, response_util_1.sendValidationError)(res, [{
                            field: 'image',
                            message: 'File size must be less than 5MB',
                            code: 'file_too_large'
                        }]);
                    return;
                }
            }
            next();
        }
        catch (error) {
            logger_util_1.logger.error('File validation error:', error);
            (0, response_util_1.sendValidationError)(res, [{
                    field: 'image',
                    message: 'File validation failed',
                    code: 'validation_error'
                }]);
        }
    };
};
exports.validateFile = validateFile;
//# sourceMappingURL=validate.middleware.js.map