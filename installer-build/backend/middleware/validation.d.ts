import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
export declare const validate: (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const schemas: {
    register: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        name: string;
        password: string;
    }, {
        email: string;
        name: string;
        password: string;
    }>;
    login: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        password: string;
    }, {
        email: string;
        password: string;
    }>;
    changePassword: z.ZodObject<{
        currentPassword: z.ZodString;
        newPassword: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        newPassword: string;
        currentPassword: string;
    }, {
        newPassword: string;
        currentPassword: string;
    }>;
    energyData: z.ZodObject<{
        deviceId: z.ZodString;
        timestamp: z.ZodString;
        cpu: z.ZodNumber;
        memory: z.ZodNumber;
        gpu: z.ZodNumber;
        disk: z.ZodNumber;
        powerConsumption: z.ZodNumber;
        temperature: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        deviceId: string;
        timestamp: string;
        cpu: number;
        memory: number;
        gpu: number;
        disk: number;
        powerConsumption: number;
        temperature: number;
    }, {
        deviceId: string;
        timestamp: string;
        cpu: number;
        memory: number;
        gpu: number;
        disk: number;
        powerConsumption: number;
        temperature: number;
    }>;
    userUpdate: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        preferences: z.ZodOptional<z.ZodObject<{
            theme: z.ZodOptional<z.ZodEnum<["light", "dark", "auto"]>>;
            notifications: z.ZodOptional<z.ZodBoolean>;
            language: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            theme?: "dark" | "light" | "auto" | undefined;
            notifications?: boolean | undefined;
            language?: string | undefined;
        }, {
            theme?: "dark" | "light" | "auto" | undefined;
            notifications?: boolean | undefined;
            language?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        email?: string | undefined;
        name?: string | undefined;
        preferences?: {
            theme?: "dark" | "light" | "auto" | undefined;
            notifications?: boolean | undefined;
            language?: string | undefined;
        } | undefined;
    }, {
        email?: string | undefined;
        name?: string | undefined;
        preferences?: {
            theme?: "dark" | "light" | "auto" | undefined;
            notifications?: boolean | undefined;
            language?: string | undefined;
        } | undefined;
    }>;
    deviceAdd: z.ZodObject<{
        name: z.ZodString;
        type: z.ZodEnum<["desktop", "laptop", "mobile", "tablet"]>;
        hardware: z.ZodObject<{
            cpu: z.ZodObject<{
                model: z.ZodString;
                cores: z.ZodNumber;
                threads: z.ZodNumber;
                maxFrequency: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                model: string;
                cores: number;
                threads: number;
                maxFrequency: number;
            }, {
                model: string;
                cores: number;
                threads: number;
                maxFrequency: number;
            }>;
            memory: z.ZodObject<{
                total: z.ZodNumber;
                type: z.ZodString;
                speed: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                total: number;
                type: string;
                speed: number;
            }, {
                total: number;
                type: string;
                speed: number;
            }>;
            gpu: z.ZodOptional<z.ZodObject<{
                model: z.ZodString;
                memory: z.ZodNumber;
                driver: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                memory: number;
                model: string;
                driver: string;
            }, {
                memory: number;
                model: string;
                driver: string;
            }>>;
        }, "strip", z.ZodTypeAny, {
            cpu: {
                model: string;
                cores: number;
                threads: number;
                maxFrequency: number;
            };
            memory: {
                total: number;
                type: string;
                speed: number;
            };
            gpu?: {
                memory: number;
                model: string;
                driver: string;
            } | undefined;
        }, {
            cpu: {
                model: string;
                cores: number;
                threads: number;
                maxFrequency: number;
            };
            memory: {
                total: number;
                type: string;
                speed: number;
            };
            gpu?: {
                memory: number;
                model: string;
                driver: string;
            } | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        type: "desktop" | "laptop" | "mobile" | "tablet";
        hardware: {
            cpu: {
                model: string;
                cores: number;
                threads: number;
                maxFrequency: number;
            };
            memory: {
                total: number;
                type: string;
                speed: number;
            };
            gpu?: {
                memory: number;
                model: string;
                driver: string;
            } | undefined;
        };
    }, {
        name: string;
        type: "desktop" | "laptop" | "mobile" | "tablet";
        hardware: {
            cpu: {
                model: string;
                cores: number;
                threads: number;
                maxFrequency: number;
            };
            memory: {
                total: number;
                type: string;
                speed: number;
            };
            gpu?: {
                memory: number;
                model: string;
                driver: string;
            } | undefined;
        };
    }>;
};
export declare const validateQuery: (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const querySchemas: {
    pagination: z.ZodObject<{
        page: z.ZodOptional<z.ZodEffects<z.ZodString, number, string>>;
        limit: z.ZodOptional<z.ZodEffects<z.ZodString, number, string>>;
        search: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        page?: number | undefined;
        limit?: number | undefined;
        search?: string | undefined;
    }, {
        page?: string | undefined;
        limit?: string | undefined;
        search?: string | undefined;
    }>;
    energyHistory: z.ZodObject<{
        timeframe: z.ZodOptional<z.ZodEnum<["1h", "24h", "7d", "30d"]>>;
        device: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        timeframe?: "24h" | "1h" | "7d" | "30d" | undefined;
        device?: string | undefined;
    }, {
        timeframe?: "24h" | "1h" | "7d" | "30d" | undefined;
        device?: string | undefined;
    }>;
    analytics: z.ZodObject<{
        period: z.ZodOptional<z.ZodEnum<["day", "week", "month", "year"]>>;
        date: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        period?: "day" | "week" | "month" | "year" | undefined;
        date?: string | undefined;
    }, {
        period?: "day" | "week" | "month" | "year" | undefined;
        date?: string | undefined;
    }>;
};
//# sourceMappingURL=validation.d.ts.map