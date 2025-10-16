import { Request, Response } from 'express';
import { energyService } from '../services/energyService';
import { createError } from '../middleware/errorHandler';

export const energyController = {
  async getCurrentUsage(req: Request, res: Response): Promise<void> {
    try {
      const currentUsage = await energyService.getCurrentEnergyUsage();
      res.status(200).json({
        success: true,
        data: currentUsage,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      throw createError('Failed to fetch current energy usage', 500);
    }
  },

  async getEnergyHistory(req: Request, res: Response): Promise<void> {
    try {
      const { timeframe = '24h', device } = req.query;
      const history = await energyService.getEnergyHistory(
        timeframe as string,
        device as string
      );
      
      res.status(200).json({
        success: true,
        data: history,
        timeframe,
        total: history.length
      });
    } catch (error) {
      throw createError('Failed to fetch energy history', 500);
    }
  },

  async saveEnergyData(req: Request, res: Response): Promise<void> {
    try {
      const energyData = req.body;
      const saved = await energyService.saveEnergyData(energyData);
      
      res.status(201).json({
        success: true,
        data: saved,
        message: 'Energy data saved successfully'
      });
    } catch (error) {
      throw createError('Failed to save energy data', 500);
    }
  },

  async getEnergyStats(req: Request, res: Response): Promise<void> {
    try {
      const { period = 'day' } = req.query;
      const stats = await energyService.getEnergyStatistics(period as string);
      
      res.status(200).json({
        success: true,
        data: stats,
        period
      });
    } catch (error) {
      throw createError('Failed to fetch energy statistics', 500);
    }
  },

  async saveBatchData(req: Request, res: Response): Promise<void> {
    try {
      const { data } = req.body;
      if (!Array.isArray(data)) {
        throw createError('Batch data must be an array', 400);
      }
      
      const result = await energyService.saveBatchEnergyData(data);
      
      res.status(201).json({
        success: true,
        data: result,
        processed: data.length,
        message: 'Batch energy data saved successfully'
      });
    } catch (error) {
      throw createError('Failed to save batch energy data', 500);
    }
  },

  async getDailyAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { date } = req.query;
      const analytics = await energyService.getDailyAnalytics(date as string);
      
      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      throw createError('Failed to fetch daily analytics', 500);
    }
  },

  async getWeeklyAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { week } = req.query;
      const analytics = await energyService.getWeeklyAnalytics(week as string);
      
      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      throw createError('Failed to fetch weekly analytics', 500);
    }
  },

  async getMonthlyAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { month } = req.query;
      const analytics = await energyService.getMonthlyAnalytics(month as string);
      
      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      throw createError('Failed to fetch monthly analytics', 500);
    }
  },

  async getEnergyGoals(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const goals = await energyService.getUserEnergyGoals(userId);
      
      res.status(200).json({
        success: true,
        data: goals
      });
    } catch (error) {
      throw createError('Failed to fetch energy goals', 500);
    }
  },

  async setEnergyGoals(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const goals = req.body;
      const updated = await energyService.setUserEnergyGoals(userId, goals);
      
      res.status(200).json({
        success: true,
        data: updated,
        message: 'Energy goals updated successfully'
      });
    } catch (error) {
      throw createError('Failed to set energy goals', 500);
    }
  },

  async getRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const recommendations = await energyService.getEnergyRecommendations(userId);
      
      res.status(200).json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      throw createError('Failed to fetch energy recommendations', 500);
    }
  }
};