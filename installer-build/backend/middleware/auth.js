"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = exports.requireAdmin = exports.optionalAuth = exports.authenticate = void 0;
const errorHandler_1 = require("./errorHandler");
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw (0, errorHandler_1.createError)('Access token required', 401);
        }
        const token = authHeader.substring(7);
        if (token === 'mock-token') {
            req.user = {
                id: '1',
                email: 'user@example.com',
                name: 'Mock User',
                role: 'user'
            };
            next();
        }
        else {
            throw (0, errorHandler_1.createError)('Invalid token', 401);
        }
    }
    catch (error) {
        next(error);
    }
};
exports.authenticate = authenticate;
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            if (token === 'mock-token') {
                req.user = {
                    id: '1',
                    email: 'user@example.com',
                    name: 'Mock User',
                    role: 'user'
                };
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.optionalAuth = optionalAuth;
const requireAdmin = (req, res, next) => {
    try {
        if (!req.user) {
            throw (0, errorHandler_1.createError)('Authentication required', 401);
        }
        if (req.user.role !== 'admin') {
            throw (0, errorHandler_1.createError)('Admin access required', 403);
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.requireAdmin = requireAdmin;
const rateLimiter = (req, res, next) => {
    const clientIp = req.ip || req.connection.remoteAddress;
    console.log(`Rate limiting check for IP: ${clientIp}`);
    next();
};
exports.rateLimiter = rateLimiter;
//# sourceMappingURL=auth.js.map