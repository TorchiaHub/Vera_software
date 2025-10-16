"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const authService_1 = require("../services/authService");
const errorHandler_1 = require("../middleware/errorHandler");
exports.authController = {
    async register(req, res) {
        try {
            const { email, password, name } = req.body;
            if (!email || !password || !name) {
                throw (0, errorHandler_1.createError)('Email, password and name are required', 400);
            }
            const result = await authService_1.authService.register({ email, password, name });
            res.status(201).json({
                success: true,
                data: result,
                message: 'User registered successfully'
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Registration failed', 500);
        }
    },
    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                throw (0, errorHandler_1.createError)('Email and password are required', 400);
            }
            const result = await authService_1.authService.login(email, password);
            res.status(200).json({
                success: true,
                data: result,
                message: 'Login successful'
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Login failed', 401);
        }
    },
    async logout(req, res) {
        try {
            res.status(200).json({
                success: true,
                message: 'Logout successful'
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Logout failed', 500);
        }
    },
    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                throw (0, errorHandler_1.createError)('Refresh token is required', 400);
            }
            const result = await authService_1.authService.refreshToken(refreshToken);
            res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Token refresh failed', 401);
        }
    },
    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                throw (0, errorHandler_1.createError)('Email is required', 400);
            }
            await authService_1.authService.forgotPassword(email);
            res.status(200).json({
                success: true,
                message: 'Password reset email sent'
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to send password reset email', 500);
        }
    },
    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;
            if (!token || !newPassword) {
                throw (0, errorHandler_1.createError)('Token and new password are required', 400);
            }
            await authService_1.authService.resetPassword(token, newPassword);
            res.status(200).json({
                success: true,
                message: 'Password reset successful'
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Password reset failed', 400);
        }
    },
    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user?.id;
            if (!currentPassword || !newPassword || !userId) {
                throw (0, errorHandler_1.createError)('Current password, new password are required', 400);
            }
            await authService_1.authService.changePassword(userId, currentPassword, newPassword);
            res.status(200).json({
                success: true,
                message: 'Password changed successfully'
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Password change failed', 400);
        }
    },
    async verifyEmail(req, res) {
        try {
            const { token } = req.body;
            if (!token) {
                throw (0, errorHandler_1.createError)('Verification token is required', 400);
            }
            await authService_1.authService.verifyEmail(token);
            res.status(200).json({
                success: true,
                message: 'Email verified successfully'
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Email verification failed', 400);
        }
    },
    async resendVerification(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                throw (0, errorHandler_1.createError)('Email is required', 400);
            }
            await authService_1.authService.resendVerificationEmail(email);
            res.status(200).json({
                success: true,
                message: 'Verification email sent'
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to send verification email', 500);
        }
    },
    async getProfile(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw (0, errorHandler_1.createError)('User not authenticated', 401);
            }
            const profile = await authService_1.authService.getUserProfile(userId);
            res.status(200).json({
                success: true,
                data: profile
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to fetch profile', 500);
        }
    },
    async updateProfile(req, res) {
        try {
            const userId = req.user?.id;
            const updates = req.body;
            if (!userId) {
                throw (0, errorHandler_1.createError)('User not authenticated', 401);
            }
            const updated = await authService_1.authService.updateUserProfile(userId, updates);
            res.status(200).json({
                success: true,
                data: updated,
                message: 'Profile updated successfully'
            });
        }
        catch (error) {
            throw (0, errorHandler_1.createError)('Failed to update profile', 500);
        }
    }
};
//# sourceMappingURL=authController.js.map