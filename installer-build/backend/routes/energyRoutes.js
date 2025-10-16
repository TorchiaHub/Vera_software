"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const energyController_1 = require("../controllers/energyController");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
router.get('/current', (0, errorHandler_1.asyncHandler)(energyController_1.energyController.getCurrentUsage));
router.get('/history', (0, errorHandler_1.asyncHandler)(energyController_1.energyController.getEnergyHistory));
router.post('/save', (0, errorHandler_1.asyncHandler)(energyController_1.energyController.saveEnergyData));
router.get('/stats', (0, errorHandler_1.asyncHandler)(energyController_1.energyController.getEnergyStats));
router.post('/batch', (0, errorHandler_1.asyncHandler)(energyController_1.energyController.saveBatchData));
router.get('/analytics/daily', (0, errorHandler_1.asyncHandler)(energyController_1.energyController.getDailyAnalytics));
router.get('/analytics/weekly', (0, errorHandler_1.asyncHandler)(energyController_1.energyController.getWeeklyAnalytics));
router.get('/analytics/monthly', (0, errorHandler_1.asyncHandler)(energyController_1.energyController.getMonthlyAnalytics));
router.get('/goals', (0, errorHandler_1.asyncHandler)(energyController_1.energyController.getEnergyGoals));
router.post('/goals', (0, errorHandler_1.asyncHandler)(energyController_1.energyController.setEnergyGoals));
router.get('/recommendations', (0, errorHandler_1.asyncHandler)(energyController_1.energyController.getRecommendations));
exports.default = router;
//# sourceMappingURL=energyRoutes.js.map