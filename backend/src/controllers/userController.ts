import { Request, Response } from 'express';
import { userService } from '../services/userService';
import { createError } from '../middleware/errorHandler';

export const userController = {
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const users = await userService.getAllUsers({
        page: Number(page),
        limit: Number(limit),
        search: search as string
      });
      
      res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      throw createError('Failed to fetch users', 500);
    }
  },

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      
      if (!user) {
        throw createError('User not found', 404);
      }
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      throw createError('Failed to fetch user', 500);
    }
  },

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const user = await userService.updateUser(id, updates);
      
      res.status(200).json({
        success: true,
        data: user,
        message: 'User updated successfully'
      });
    } catch (error) {
      throw createError('Failed to update user', 500);
    }
  },

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await userService.deleteUser(id);
      
      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      throw createError('Failed to delete user', 500);
    }
  },

  async getUserPreferences(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const preferences = await userService.getUserPreferences(id);
      
      res.status(200).json({
        success: true,
        data: preferences
      });
    } catch (error) {
      throw createError('Failed to fetch user preferences', 500);
    }
  },

  async updatePreferences(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const preferences = req.body;
      
      const updated = await userService.updateUserPreferences(id, preferences);
      
      res.status(200).json({
        success: true,
        data: updated,
        message: 'Preferences updated successfully'
      });
    } catch (error) {
      throw createError('Failed to update preferences', 500);
    }
  },

  async getUserStats(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const stats = await userService.getUserStats(id);
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      throw createError('Failed to fetch user stats', 500);
    }
  },

  async getUserAchievements(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const achievements = await userService.getUserAchievements(id);
      
      res.status(200).json({
        success: true,
        data: achievements
      });
    } catch (error) {
      throw createError('Failed to fetch user achievements', 500);
    }
  },

  async getGlobalLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 10, period = 'week' } = req.query;
      const leaderboard = await userService.getGlobalLeaderboard({
        limit: Number(limit),
        period: period as string
      });
      
      res.status(200).json({
        success: true,
        data: leaderboard
      });
    } catch (error) {
      throw createError('Failed to fetch global leaderboard', 500);
    }
  },

  async getFriendsLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { limit = 10 } = req.query;
      
      const leaderboard = await userService.getFriendsLeaderboard(id, Number(limit));
      
      res.status(200).json({
        success: true,
        data: leaderboard
      });
    } catch (error) {
      throw createError('Failed to fetch friends leaderboard', 500);
    }
  }
};