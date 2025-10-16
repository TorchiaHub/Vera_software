import { Request, Response } from 'express';
export declare const userController: {
    getAllUsers(req: Request, res: Response): Promise<void>;
    getUserById(req: Request, res: Response): Promise<void>;
    updateUser(req: Request, res: Response): Promise<void>;
    deleteUser(req: Request, res: Response): Promise<void>;
    getUserPreferences(req: Request, res: Response): Promise<void>;
    updatePreferences(req: Request, res: Response): Promise<void>;
    getUserStats(req: Request, res: Response): Promise<void>;
    getUserAchievements(req: Request, res: Response): Promise<void>;
    getGlobalLeaderboard(req: Request, res: Response): Promise<void>;
    getFriendsLeaderboard(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=userController.d.ts.map