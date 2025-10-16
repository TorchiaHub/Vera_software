import { Request, Response } from 'express';
export declare const energyController: {
    getCurrentUsage(req: Request, res: Response): Promise<void>;
    getEnergyHistory(req: Request, res: Response): Promise<void>;
    saveEnergyData(req: Request, res: Response): Promise<void>;
    getEnergyStats(req: Request, res: Response): Promise<void>;
    saveBatchData(req: Request, res: Response): Promise<void>;
    getDailyAnalytics(req: Request, res: Response): Promise<void>;
    getWeeklyAnalytics(req: Request, res: Response): Promise<void>;
    getMonthlyAnalytics(req: Request, res: Response): Promise<void>;
    getEnergyGoals(req: Request, res: Response): Promise<void>;
    setEnergyGoals(req: Request, res: Response): Promise<void>;
    getRecommendations(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=energyController.d.ts.map