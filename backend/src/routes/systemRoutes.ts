import { Router } from 'express';
import { systemController } from '../controllers/systemController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// System monitoring endpoints
router.get('/monitor', asyncHandler(systemController.getSystemMetrics));
router.get('/hardware', asyncHandler(systemController.getHardwareInfo));
router.get('/performance', asyncHandler(systemController.getPerformanceData));

// Device management
router.get('/devices', asyncHandler(systemController.getConnectedDevices));
router.post('/devices', asyncHandler(systemController.addDevice));
router.put('/devices/:id', asyncHandler(systemController.updateDevice));
router.delete('/devices/:id', asyncHandler(systemController.removeDevice));

// System health
router.get('/health', asyncHandler(systemController.getSystemHealth));
router.get('/status', asyncHandler(systemController.getSystemStatus));

// Notifications
router.get('/notifications', asyncHandler(systemController.getNotifications));
router.post('/notifications', asyncHandler(systemController.createNotification));
router.put('/notifications/:id/read', asyncHandler(systemController.markNotificationRead));

export default router;