export declare const systemService: {
    getSystemMetrics(): Promise<any>;
    getHardwareInfo(): Promise<any>;
    getPerformanceData(timeframe: string): Promise<any[]>;
    getConnectedDevices(): Promise<any[]>;
    addDevice(deviceData: any): Promise<any>;
    updateDevice(id: string, updates: any): Promise<any>;
    removeDevice(id: string): Promise<void>;
    getSystemHealth(): Promise<any>;
    getSystemStatus(): Promise<any>;
    getNotifications(userId?: string): Promise<any[]>;
    createNotification(notificationData: any): Promise<any>;
    markNotificationRead(id: string): Promise<void>;
};
//# sourceMappingURL=systemService.d.ts.map