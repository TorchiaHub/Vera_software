import { Request, Response } from 'express';
import { systemService } from '../services/systemService';
import { createError } from '../middleware/errorHandler';

export const systemController = {
  async getSystemMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = await systemService.getSystemMetrics();
      
      res.status(200).json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      throw createError('Failed to fetch system metrics', 500);
    }
  },

  async getHardwareInfo(req: Request, res: Response): Promise<void> {
    try {
      const hardware = await systemService.getHardwareInfo();
      
      res.status(200).json({
        success: true,
        data: hardware
      });
    } catch (error) {
      throw createError('Failed to fetch hardware information', 500);
    }
  },

  async getPerformanceData(req: Request, res: Response): Promise<void> {
    try {
      const { timeframe = '1h' } = req.query;
      const performance = await systemService.getPerformanceData(timeframe as string);
      
      res.status(200).json({
        success: true,
        data: performance,
        timeframe
      });
    } catch (error) {
      throw createError('Failed to fetch performance data', 500);
    }
  },

  async getConnectedDevices(req: Request, res: Response): Promise<void> {
    try {
      const devices = await systemService.getConnectedDevices();
      
      res.status(200).json({
        success: true,
        data: devices
      });
    } catch (error) {
      throw createError('Failed to fetch connected devices', 500);
    }
  },

  async addDevice(req: Request, res: Response): Promise<void> {
    try {
      const deviceData = req.body;
      const device = await systemService.addDevice(deviceData);
      
      res.status(201).json({
        success: true,
        data: device,
        message: 'Device added successfully'
      });
    } catch (error) {
      throw createError('Failed to add device', 500);
    }
  },

  async updateDevice(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const device = await systemService.updateDevice(id, updates);
      
      res.status(200).json({
        success: true,
        data: device,
        message: 'Device updated successfully'
      });
    } catch (error) {
      throw createError('Failed to update device', 500);
    }
  },

  async removeDevice(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await systemService.removeDevice(id);
      
      res.status(200).json({
        success: true,
        message: 'Device removed successfully'
      });
    } catch (error) {
      throw createError('Failed to remove device', 500);
    }
  },

  async getSystemHealth(req: Request, res: Response): Promise<void> {
    try {
      const health = await systemService.getSystemHealth();
      
      res.status(200).json({
        success: true,
        data: health
      });
    } catch (error) {
      throw createError('Failed to fetch system health', 500);
    }
  },

  async getSystemStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = await systemService.getSystemStatus();
      
      res.status(200).json({
        success: true,
        data: status
      });
    } catch (error) {
      throw createError('Failed to fetch system status', 500);
    }
  },

  async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.query;
      const notifications = await systemService.getNotifications(userId as string);
      
      res.status(200).json({
        success: true,
        data: notifications
      });
    } catch (error) {
      throw createError('Failed to fetch notifications', 500);
    }
  },

  async createNotification(req: Request, res: Response): Promise<void> {
    try {
      const notificationData = req.body;
      const notification = await systemService.createNotification(notificationData);
      
      res.status(201).json({
        success: true,
        data: notification,
        message: 'Notification created successfully'
      });
    } catch (error) {
      throw createError('Failed to create notification', 500);
    }
  },

  async markNotificationRead(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await systemService.markNotificationRead(id);
      
      res.status(200).json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      throw createError('Failed to mark notification as read', 500);
    }
  }
};