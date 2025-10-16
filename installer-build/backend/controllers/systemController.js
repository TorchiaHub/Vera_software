"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemController = void 0;
const systemService_1 = require("../services/systemService");
const errorHandler_1 = require("../middleware/errorHandler");
exports.systemController = {
    async getSystemMetrics(req, res) {
        try {
            const metrics = await systemService_1.systemService.getSystemMetrics();
            res.status(200).json({
                success: true,
                data: metrics,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch system metrics', 500);
        }
    },
    async getHardwareInfo(req, res) {
        try {
            const hardware = await systemService_1.systemService.getHardwareInfo();
            res.status(200).json({
                success: true,
                data: hardware
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch hardware information', 500);
        }
    },
    async getPerformanceData(req, res) {
        try {
            const { timeframe = '1h' } = req.query;
            const performance = await systemService_1.systemService.getPerformanceData(timeframe);
            res.status(200).json({
                success: true,
                data: performance,
                timeframe
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch performance data', 500);
        }
    },
    async getConnectedDevices(req, res) {
        try {
            const devices = await systemService_1.systemService.getConnectedDevices();
            res.status(200).json({
                success: true,
                data: devices
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch connected devices', 500);
        }
    },
    async addDevice(req, res) {
        try {
            const deviceData = req.body;
            const device = await systemService_1.systemService.addDevice(deviceData);
            res.status(201).json({
                success: true,
                data: device,
                message: 'Device added successfully'
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to add device', 500);
        }
    },
    async updateDevice(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;
            const device = await systemService_1.systemService.updateDevice(id, updates);
            res.status(200).json({
                success: true,
                data: device,
                message: 'Device updated successfully'
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to update device', 500);
        }
    },
    async removeDevice(req, res) {
        try {
            const { id } = req.params;
            await systemService_1.systemService.removeDevice(id);
            res.status(200).json({
                success: true,
                message: 'Device removed successfully'
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to remove device', 500);
        }
    },
    async getSystemHealth(req, res) {
        try {
            const health = await systemService_1.systemService.getSystemHealth();
            res.status(200).json({
                success: true,
                data: health
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch system health', 500);
        }
    },
    async getSystemStatus(req, res) {
        try {
            const status = await systemService_1.systemService.getSystemStatus();
            res.status(200).json({
                success: true,
                data: status
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch system status', 500);
        }
    },
    async getNotifications(req, res) {
        try {
            const { userId } = req.query;
            const notifications = await systemService_1.systemService.getNotifications(userId);
            res.status(200).json({
                success: true,
                data: notifications
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch notifications', 500);
        }
    },
    async createNotification(req, res) {
        try {
            const notificationData = req.body;
            const notification = await systemService_1.systemService.createNotification(notificationData);
            res.status(201).json({
                success: true,
                data: notification,
                message: 'Notification created successfully'
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to create notification', 500);
        }
    },
    async markNotificationRead(req, res) {
        try {
            const { id } = req.params;
            await systemService_1.systemService.markNotificationRead(id);
            res.status(200).json({
                success: true,
                message: 'Notification marked as read'
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to mark notification as read', 500);
        }
    }
};
//# sourceMappingURL=systemController.js.map