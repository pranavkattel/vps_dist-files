"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.isTokenExpired = exports.extractToken = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const generateToken = (tokenPayload) => {
    const payload = {
        id: tokenPayload.id,
        email: tokenPayload.email,
        role: tokenPayload.role,
    };
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, {
        expiresIn: env_1.env.JWT_EXPIRES_IN,
        issuer: 'sarkari-kaam-api',
        audience: 'sarkari-kaam-admin',
    });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET, {
            issuer: 'sarkari-kaam-api',
            audience: 'sarkari-kaam-admin',
        });
        return decoded;
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new Error('Token expired');
        }
        else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new Error('Invalid token');
        }
        else {
            throw new Error('Token verification failed');
        }
    }
};
exports.verifyToken = verifyToken;
const extractToken = (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
};
exports.extractToken = extractToken;
const isTokenExpired = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.decode(token);
        if (!decoded || !decoded.exp)
            return true;
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime;
    }
    catch {
        return true;
    }
};
exports.isTokenExpired = isTokenExpired;
const refreshToken = (oldToken) => {
    const decoded = (0, exports.verifyToken)(oldToken);
    const payload = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
    };
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, {
        expiresIn: env_1.env.JWT_EXPIRES_IN,
        issuer: 'sarkari-kaam-api',
        audience: 'sarkari-kaam-admin',
    });
};
exports.refreshToken = refreshToken;
//# sourceMappingURL=jwt.util.js.map