"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findByReferenceCode = exports.getReferenceCodeType = exports.isValidReferenceCode = exports.generateUniqueReferenceCode = void 0;
const models_1 = require("../models");
const generateRandomString = (length = 5) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};
const generateReferenceCode = (type) => {
    const prefixes = {
        task: 'TASK',
        update: 'UPD',
        edit: 'EDIT',
    };
    const prefix = prefixes[type];
    const randomPart = generateRandomString(5);
    return `${prefix}-${randomPart}`;
};
const referenceCodeExists = async (code) => {
    const existing = await models_1.Contribution.findOne({ reference_code: code }).lean();
    return !!existing;
};
const generateUniqueReferenceCode = async (type) => {
    let code = generateReferenceCode(type);
    let attempts = 0;
    const maxAttempts = 10;
    while (await referenceCodeExists(code) && attempts < maxAttempts) {
        code = generateReferenceCode(type);
        attempts++;
    }
    if (attempts >= maxAttempts) {
        throw new Error('Failed to generate unique reference code after maximum attempts');
    }
    return code;
};
exports.generateUniqueReferenceCode = generateUniqueReferenceCode;
const isValidReferenceCode = (code) => {
    const patterns = {
        task: /^TASK-[A-Z0-9]{5}$/,
        update: /^UPD-[A-Z0-9]{5}$/,
        edit: /^EDIT-[A-Z0-9]{5}$/,
    };
    return Object.values(patterns).some(pattern => pattern.test(code));
};
exports.isValidReferenceCode = isValidReferenceCode;
const getReferenceCodeType = (code) => {
    if (code.startsWith('TASK-')) {
        return 'task';
    }
    else if (code.startsWith('UPD-')) {
        return 'update';
    }
    else if (code.startsWith('EDIT-')) {
        return 'edit';
    }
    else {
        return 'unknown';
    }
};
exports.getReferenceCodeType = getReferenceCodeType;
const findByReferenceCode = async (code) => {
    const type = (0, exports.getReferenceCodeType)(code);
    switch (type) {
        case 'task':
        case 'update':
        case 'edit':
            const contribution = await models_1.Contribution.findOne({ reference_code: code }).lean();
            return contribution ? {
                type: type === 'task' ? 'task' : type === 'update' ? 'update' : 'edit_suggestion',
                data: contribution
            } : null;
        default:
            return null;
    }
};
exports.findByReferenceCode = findByReferenceCode;
//# sourceMappingURL=referenceCode.util.js.map