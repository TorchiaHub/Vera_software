import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createError } from './errorHandler';

// Validation middleware factory
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessages = result.error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        ).join(', ');
        
        throw createError(`Validation failed: ${errorMessages}`, 400);
      }
      
      req.body = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Common validation schemas
export const schemas = {
  register: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters')
  }),
  
  login: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required')
  }),
  
  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters')
  }),
  
  energyData: z.object({
    deviceId: z.string(),
    timestamp: z.string().datetime(),
    cpu: z.number().min(0).max(100),
    memory: z.number().min(0).max(100),
    gpu: z.number().min(0).max(100),
    disk: z.number().min(0).max(100),
    powerConsumption: z.number().min(0),
    temperature: z.number()
  }),
  
  userUpdate: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    preferences: z.object({
      theme: z.enum(['light', 'dark', 'auto']).optional(),
      notifications: z.boolean().optional(),
      language: z.string().optional()
    }).optional()
  }),
  
  deviceAdd: z.object({
    name: z.string().min(1, 'Device name is required'),
    type: z.enum(['desktop', 'laptop', 'mobile', 'tablet']),
    hardware: z.object({
      cpu: z.object({
        model: z.string(),
        cores: z.number(),
        threads: z.number(),
        maxFrequency: z.number()
      }),
      memory: z.object({
        total: z.number(),
        type: z.string(),
        speed: z.number()
      }),
      gpu: z.object({
        model: z.string(),
        memory: z.number(),
        driver: z.string()
      }).optional()
    })
  })
};

// Query validation
export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.query);
      
      if (!result.success) {
        const errorMessages = result.error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        ).join(', ');
        
        throw createError(`Query validation failed: ${errorMessages}`, 400);
      }
      
      req.query = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Common query schemas
export const querySchemas = {
  pagination: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    search: z.string().optional()
  }),
  
  energyHistory: z.object({
    timeframe: z.enum(['1h', '24h', '7d', '30d']).optional(),
    device: z.string().optional()
  }),
  
  analytics: z.object({
    period: z.enum(['day', 'week', 'month', 'year']).optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
  })
};