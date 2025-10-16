import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express';
export declare const authenticate: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const rateLimiter: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map