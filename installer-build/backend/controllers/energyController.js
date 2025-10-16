"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.energyController = void 0;
const energyService_1 = require("../services/energyService");
const errorHandler_1 = require("../middleware/errorHandler");
exports.energyController = {
    async getCurrentUsage(req, res) {
        try {
            const currentUsage = await energyService_1.energyService.getCurrentEnergyUsage();
            res.status(200).json({
                success: true,
                data: currentUsage,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch current energy usage', 500);
        }
    },
    async getEnergyHistory(req, res) {
        try {
            const { timeframe = '24h', device } = req.query;
            const history = await energyService_1.energyService.getEnergyHistory(timeframe, device);
            res.status(200).json({
                success: true,
                data: history,
                timeframe,
                total: history.length
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch energy history', 500);
        }
    },
    async saveEnergyData(req, res) {
        try {
            const energyData = req.body;
            const saved = await energyService_1.energyService.saveEnergyData(energyData);
            res.status(201).json({
                success: true,
                data: saved,
                message: 'Energy data saved successfully'
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to save energy data', 500);
        }
    },
    async getEnergyStats(req, res) {
        try {
            const { period = 'day' } = req.query;
            const stats = await energyService_1.energyService.getEnergyStatistics(period);
            res.status(200).json({
                success: true,
                data: stats,
                period
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch energy statistics', 500);
        }
    },
    async saveBatchData(req, res) {
        try {
            const { data } = req.body;
            if (!Array.isArray(data)) {
                throw (0, errorHandler_1.createError)('Batch data must be an array', 400);
            }
            const result = await energyService_1.energyService.saveBatchEnergyData(data);
            res.status(201).json({
                success: true,
                data: result,
                processed: data.length,
                message: 'Batch energy data saved successfully'
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to save batch energy data', 500);
        }
    },
    async getDailyAnalytics(req, res) {
        try {
            const { date } = req.query;
            const analytics = await energyService_1.energyService.getDailyAnalytics(date);
            res.status(200).json({
                success: true,
                data: analytics
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch daily analytics', 500);
        }
    },
    async getWeeklyAnalytics(req, res) {
        try {
            const { week } = req.query;
            const analytics = await energyService_1.energyService.getWeeklyAnalytics(week);
            res.status(200).json({
                success: true,
                data: analytics
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch weekly analytics', 500);
        }
    },
    async getMonthlyAnalytics(req, res) {
        try {
            const { month } = req.query;
            const analytics = await energyService_1.energyService.getMonthlyAnalytics(month);
            res.status(200).json({
                success: true,
                data: analytics
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch monthly analytics', 500);
        }
    },
    async getEnergyGoals(req, res) {
        try {
            const { userId } = req.params;
            const goals = await energyService_1.energyService.getUserEnergyGoals(userId);
            res.status(200).json({
                success: true,
                data: goals
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch energy goals', 500);
        }
    },
    async setEnergyGoals(req, res) {
        try {
            const { userId } = req.params;
            const goals = req.body;
            const updated = await energyService_1.energyService.setUserEnergyGoals(userId, goals);
            res.status(200).json({
                success: true,
                data: updated,
                message: 'Energy goals updated successfully'
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to set energy goals', 500);
        }
    },
    async getRecommendations(req, res) {
        try {
            const { userId } = req.params;
            const recommendations = await energyService_1.energyService.getEnergyRecommendations(userId);
            res.status(200).json({
                success: true,
                data: recommendations
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch energy recommendations', 500);
        }
    }
};
//# sourceMappingURL=energyController.js.map