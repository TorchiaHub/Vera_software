import { Router } from 'express';
import { energyController } from '../controllers/energyController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Energy monitoring endpoints
router.get('/current', asyncHandler(energyController.getCurrentUsage));
router.get('/history', asyncHandler(energyController.getEnergyHistory));
router.post('/save', asyncHandler(energyController.saveEnergyData));
router.get('/stats', asyncHandler(energyController.getEnergyStats));
router.post('/batch', asyncHandler(energyController.saveBatchData));

// Energy analytics
router.get('/analytics/daily', asyncHandler(energyController.getDailyAnalytics));
router.get('/analytics/weekly', asyncHandler(energyController.getWeeklyAnalytics));
router.get('/analytics/monthly', asyncHandler(energyController.getMonthlyAnalytics));

// Energy goals and recommendations
router.get('/goals', asyncHandler(energyController.getEnergyGoals));
router.post('/goals', asyncHandler(energyController.setEnergyGoals));
router.get('/recommendations', asyncHandler(energyController.getRecommendations));

export default router;