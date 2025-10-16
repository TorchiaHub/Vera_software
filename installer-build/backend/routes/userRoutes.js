"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
router.get('/', (0, errorHandler_1.asyncHandler)(userController_1.userController.getAllUsers));
router.get('/:id', (0, errorHandler_1.asyncHandler)(userController_1.userController.getUserById));
router.put('/:id', (0, errorHandler_1.asyncHandler)(userController_1.userController.updateUser));
router.delete('/:id', (0, errorHandler_1.asyncHandler)(userController_1.userController.deleteUser));
router.get('/:id/preferences', (0, errorHandler_1.asyncHandler)(userController_1.userController.getUserPreferences));
router.put('/:id/preferences', (0, errorHandler_1.asyncHandler)(userController_1.userController.updatePreferences));
router.get('/:id/stats', (0, errorHandler_1.asyncHandler)(userController_1.userController.getUserStats));
router.get('/:id/achievements', (0, errorHandler_1.asyncHandler)(userController_1.userController.getUserAchievements));
router.get('/leaderboard/global', (0, errorHandler_1.asyncHandler)(userController_1.userController.getGlobalLeaderboard));
router.get('/leaderboard/friends', (0, errorHandler_1.asyncHandler)(userController_1.userController.getFriendsLeaderboard));
exports.default = router;
//# sourceMappingURL=userRoutes.js.map