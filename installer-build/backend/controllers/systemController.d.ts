import { Request, Response } from 'express';
export declare const systemController: {
    getSystemMetrics(req: Request, res: Response): Promise<void>;
    getHardwareInfo(req: Request, res: Response): Promise<void>;
    getPerformanceData(req: Request, res: Response): Promise<void>;
    getConnectedDevices(req: Request, res: Response): Promise<void>;
    addDevice(req: Request, res: Response): Promise<void>;
    updateDevice(req: Request, res: Response): Promise<void>;
    removeDevice(req: Request, res: Response): Promise<void>;
    getSystemHealth(req: Request, res: Response): Promise<void>;
    getSystemStatus(req: Request, res: Response): Promise<void>;
    getNotifications(req: Request, res: Response): Promise<void>;
    createNotification(req: Request, res: Response): Promise<void>;
    markNotificationRead(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=systemController.d.ts.map