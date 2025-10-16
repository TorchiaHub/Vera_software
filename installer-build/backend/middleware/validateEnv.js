"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = void 0;
const validateEnv = (req, res, next) => {
    const requiredEnvVars = ['NODE_ENV'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
        console.warn('⚠️ Missing environment variables:', missingVars);
    }
    if (!process.env.NODE_ENV) {
        process.env.NODE_ENV = 'development';
    }
    if (!process.env.PORT) {
        process.env.PORT = '3001';
    }
    if (!process.env.FRONTEND_URL) {
        process.env.FRONTEND_URL = 'http://localhost:5173';
    }
    next();
};
exports.validateEnv = validateEnv;
//# sourceMappingURL=validateEnv.js.map