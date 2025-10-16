import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/express';
export declare const authController: {
    register(req: Request, res: Response): Promise<void>;
    login(req: Request, res: Response): Promise<void>;
    logout(req: Request, res: Response): Promise<void>;
    refreshToken(req: Request, res: Response): Promise<void>;
    forgotPassword(req: Request, res: Response): Promise<void>;
    resetPassword(req: Request, res: Response): Promise<void>;
    changePassword(req: AuthenticatedRequest, res: Response): Promise<void>;
    verifyEmail(req: Request, res: Response): Promise<void>;
    resendVerification(req: Request, res: Response): Promise<void>;
    getProfile(req: AuthenticatedRequest, res: Response): Promise<void>;
    updateProfile(req: AuthenticatedRequest, res: Response): Promise<void>;
};
//# sourceMappingURL=authController.d.ts.map