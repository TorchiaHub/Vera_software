// VERA Backend Entry Point
// This file exports all the main components of the backend

export { default as Server } from './server';

// Controllers
export * from './controllers/authController';
export * from './controllers/energyController';
export * from './controllers/systemController';
export * from './controllers/userController';

// Services
export * from './services/authService';
export * from './services/energyService';
export * from './services/systemService';
export * from './services/userService';

// Middleware
export * from './middleware/auth';
export * from './middleware/errorHandler';
export * from './middleware/validateEnv';
export * from './middleware/validation';

// Types
export * from './types';
export * from './types/express';

// Routes are not exported as they are used internally by the server