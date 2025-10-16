import { Router } from 'express';
import { userController } from '../controllers/userController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// User management
router.get('/', asyncHandler(userController.getAllUsers));
router.get('/:id', asyncHandler(userController.getUserById));
router.put('/:id', asyncHandler(userController.updateUser));
router.delete('/:id', asyncHandler(userController.deleteUser));

// User preferences
router.get('/:id/preferences', asyncHandler(userController.getUserPreferences));
router.put('/:id/preferences', asyncHandler(userController.updatePreferences));

// User statistics
router.get('/:id/stats', asyncHandler(userController.getUserStats));
router.get('/:id/achievements', asyncHandler(userController.getUserAchievements));

// Leaderboard
router.get('/leaderboard/global', asyncHandler(userController.getGlobalLeaderboard));
router.get('/leaderboard/friends', asyncHandler(userController.getFriendsLeaderboard));

export default router;