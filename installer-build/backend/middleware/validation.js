"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.querySchemas = exports.validateQuery = exports.schemas = exports.validate = void 0;
const zod_1 = require("zod");
const errorHandler_1 = require("./errorHandler");
const validate = (schema) => {
    return (req, res, next) => {
        try {
            const result = schema.safeParse(req.body);
            if (!result.success) {
                const errorMessages = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
                throw (0, errorHandler_1.createError)(`Validation failed: ${errorMessages}`, 400);
            }
            req.body = result.data;
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.validate = validate;
exports.schemas = {
    register: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email format'),
        password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters')
    }),
    login: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email format'),
        password: zod_1.z.string().min(1, 'Password is required')
    }),
    changePassword: zod_1.z.object({
        currentPassword: zod_1.z.string().min(1, 'Current password is required'),
        newPassword: zod_1.z.string().min(8, 'New password must be at least 8 characters')
    }),
    energyData: zod_1.z.object({
        deviceId: zod_1.z.string(),
        timestamp: zod_1.z.string().datetime(),
        cpu: zod_1.z.number().min(0).max(100),
        memory: zod_1.z.number().min(0).max(100),
        gpu: zod_1.z.number().min(0).max(100),
        disk: zod_1.z.number().min(0).max(100),
        powerConsumption: zod_1.z.number().min(0),
        temperature: zod_1.z.number()
    }),
    userUpdate: zod_1.z.object({
        name: zod_1.z.string().min(2).optional(),
        email: zod_1.z.string().email().optional(),
        preferences: zod_1.z.object({
            theme: zod_1.z.enum(['light', 'dark', 'auto']).optional(),
            notifications: zod_1.z.boolean().optional(),
            language: zod_1.z.string().optional()
        }).optional()
    }),
    deviceAdd: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Device name is required'),
        type: zod_1.z.enum(['desktop', 'laptop', 'mobile', 'tablet']),
        hardware: zod_1.z.object({
            cpu: zod_1.z.object({
                model: zod_1.z.string(),
                cores: zod_1.z.number(),
                threads: zod_1.z.number(),
                maxFrequency: zod_1.z.number()
            }),
            memory: zod_1.z.object({
                total: zod_1.z.number(),
                type: zod_1.z.string(),
                speed: zod_1.z.number()
            }),
            gpu: zod_1.z.object({
                model: zod_1.z.string(),
                memory: zod_1.z.number(),
                driver: zod_1.z.string()
            }).optional()
        })
    })
};
const validateQuery = (schema) => {
    return (req, res, next) => {
        try {
            const result = schema.safeParse(req.query);
            if (!result.success) {
                const errorMessages = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
                throw (0, errorHandler_1.createError)(`Query validation failed: ${errorMessages}`, 400);
            }
            req.query = result.data;
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.validateQuery = validateQuery;
exports.querySchemas = {
    pagination: zod_1.z.object({
        page: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
        limit: zod_1.z.string().regex(/^\d+$/).transform(Number).optional(),
        search: zod_1.z.string().optional()
    }),
    energyHistory: zod_1.z.object({
        timeframe: zod_1.z.enum(['1h', '24h', '7d', '30d']).optional(),
        device: zod_1.z.string().optional()
    }),
    analytics: zod_1.z.object({
        period: zod_1.z.enum(['day', 'week', 'month', 'year']).optional(),
        date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
    })
};
//# sourceMappingURL=validation.js.map