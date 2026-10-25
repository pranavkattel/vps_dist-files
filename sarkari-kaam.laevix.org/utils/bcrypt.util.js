"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPasswordStrength = exports.generateRandomPassword = exports.verifyPassword = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const hashPassword = async (password) => {
    const saltRounds = 12;
    return bcrypt_1.default.hash(password, saltRounds);
};
exports.hashPassword = hashPassword;
const verifyPassword = async (password, hash) => {
    return bcrypt_1.default.compare(password, hash);
};
exports.verifyPassword = verifyPassword;
const generateRandomPassword = (length = 12) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
};
exports.generateRandomPassword = generateRandomPassword;
const checkPasswordStrength = (password) => {
    const requirements = {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    const score = Object.values(requirements).reduce((sum, req) => sum + (req ? 1 : 0), 0);
    let strength;
    if (score <= 2) {
        strength = 'weak';
    }
    else if (score <= 4) {
        strength = 'medium';
    }
    else {
        strength = 'strong';
    }
    return {
        strength,
        score,
        requirements,
    };
};
exports.checkPasswordStrength = checkPasswordStrength;
//# sourceMappingURL=bcrypt.util.js.map