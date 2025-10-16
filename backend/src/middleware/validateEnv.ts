import { Request, Response, NextFunction } from 'express';

export const validateEnv = (req: Request, res: Response, next: NextFunction): void => {
  const requiredEnvVars = ['NODE_ENV'];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn('⚠️ Missing environment variables:', missingVars);
  }
  
  // Set default values for development
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