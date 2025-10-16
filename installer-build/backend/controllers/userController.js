"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const userService_1 = require("../services/userService");
const errorHandler_1 = require("../middleware/errorHandler");
exports.userController = {
    async getAllUsers(req, res) {
        try {
            const { page = 1, limit = 10, search } = req.query;
            const users = await userService_1.userService.getAllUsers({
                page: Number(page),
                limit: Number(limit),
                search: search
            });
            res.status(200).json({
                success: true,
                data: users
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch users', 500);
        }
    },
    async getUserById(req, res) {
        try {
            const { id } = req.params;
            const user = await userService_1.userService.getUserById(id);
            if (!user) {
                throw (0, errorHandler_1.createError)('User not found', 404);
            }
            res.status(200).json({
                success: true,
                data: user
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch user', 500);
        }
    },
    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;
            const user = await userService_1.userService.updateUser(id, updates);
            res.status(200).json({
                success: true,
                data: user,
                message: 'User updated successfully'
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to update user', 500);
        }
    },
    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            await userService_1.userService.deleteUser(id);
            res.status(200).json({
                success: true,
                message: 'User deleted successfully'
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to delete user', 500);
        }
    },
    async getUserPreferences(req, res) {
        try {
            const { id } = req.params;
            const preferences = await userService_1.userService.getUserPreferences(id);
            res.status(200).json({
                success: true,
                data: preferences
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch user preferences', 500);
        }
    },
    async updatePreferences(req, res) {
        try {
            const { id } = req.params;
            const preferences = req.body;
            const updated = await userService_1.userService.updateUserPreferences(id, preferences);
            res.status(200).json({
                success: true,
                data: updated,
                message: 'Preferences updated successfully'
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to update preferences', 500);
        }
    },
    async getUserStats(req, res) {
        try {
            const { id } = req.params;
            const stats = await userService_1.userService.getUserStats(id);
            res.status(200).json({
                success: true,
                data: stats
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch user stats', 500);
        }
    },
    async getUserAchievements(req, res) {
        try {
            const { id } = req.params;
            const achievements = await userService_1.userService.getUserAchievements(id);
            res.status(200).json({
                success: true,
                data: achievements
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch user achievements', 500);
        }
    },
    async getGlobalLeaderboard(req, res) {
        try {
            const { limit = 10, period = 'week' } = req.query;
            const leaderboard = await userService_1.userService.getGlobalLeaderboard({
                limit: Number(limit),
                period: period
            });
            res.status(200).json({
                success: true,
                data: leaderboard
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch global leaderboard', 500);
        }
    },
    async getFriendsLeaderboard(req, res) {
        try {
            const { id } = req.params;
            const { limit = 10 } = req.query;
            const leaderboard = await userService_1.userService.getFriendsLeaderboard(id, Number(limit));
            res.status(200).json({
                success: true,
                data: leaderboard
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch friends leaderboard', 500);
        }
    }
};
//# sourceMappingURL=userController.js.map