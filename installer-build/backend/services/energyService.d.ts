interface EnergyData {
    deviceId: string;
    timestamp: string;
    cpu: number;
    memory: number;
    gpu: number;
    disk: number;
    powerConsumption: number;
    temperature: number;
}
interface EnergyStats {
    average: number;
    peak: number;
    total: number;
    efficiency: number;
    trend: string;
}
export declare const energyService: {
    getCurrentEnergyUsage(): Promise<EnergyData>;
    getEnergyHistory(timeframe: string, device?: string): Promise<EnergyData[]>;
    saveEnergyData(energyData: EnergyData): Promise<EnergyData>;
    getEnergyStatistics(period: string): Promise<EnergyStats>;
    saveBatchEnergyData(data: EnergyData[]): Promise<{
        saved: number;
        errors: number;
    }>;
    getDailyAnalytics(date?: string): Promise<any>;
    getWeeklyAnalytics(week?: string): Promise<any>;
    getMonthlyAnalytics(month?: string): Promise<any>;
    getUserEnergyGoals(userId: string): Promise<any>;
    setUserEnergyGoals(userId: string, goals: any): Promise<any>;
    getEnergyRecommendations(userId: string): Promise<any[]>;
};
export {};
//# sourceMappingURL=energyService.d.ts.map