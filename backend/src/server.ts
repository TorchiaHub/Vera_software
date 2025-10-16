import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { validateEnv } from './middleware/validateEnv';
import energyRoutes from './routes/energyRoutes';
import userRoutes from './routes/userRoutes';
import systemRoutes from './routes/systemRoutes';
import authRoutes from './routes/authRoutes';

// Load environment variables
dotenv.config();

class Server {
  public app: Express;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3001', 10);
    
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS configuration
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    }));

    // Logging
    this.app.use(morgan('combined'));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Environment validation
    this.app.use(validateEnv);
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/energy', energyRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/system', systemRoutes);

    // 404 handler
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl,
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      console.log(`🚀 VERA Backend Server running on port ${this.port}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    });
  }
}

// Start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  const server = new Server();
  server.listen();
}

// Export app for testing
const serverInstance = new Server();
export const app = serverInstance.app;
export default serverInstance;