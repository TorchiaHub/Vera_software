import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../types/express';

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name } = req.body;
      
      if (!email || !password || !name) {
        throw createError('Email, password and name are required', 400);
      }
      
      const result = await authService.register({ email, password, name });
      
      res.status(201).json({
        success: true,
        data: result,
        message: 'User registered successfully'
      });
    } catch (error) {
      throw createError('Registration failed', 500);
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        throw createError('Email and password are required', 400);
      }
      
      const result = await authService.login(email, password);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Login successful'
      });
    } catch (error) {
      throw createError('Login failed', 401);
    }
  },

  async logout(req: Request, res: Response): Promise<void> {
    try {
      // Implementation depends on token strategy
      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      throw createError('Logout failed', 500);
    }
  },

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        throw createError('Refresh token is required', 400);
      }
      
      const result = await authService.refreshToken(refreshToken);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      throw createError('Token refresh failed', 401);
    }
  },

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      
      if (!email) {
        throw createError('Email is required', 400);
      }
      
      await authService.forgotPassword(email);
      
      res.status(200).json({
        success: true,
        message: 'Password reset email sent'
      });
    } catch (error) {
      throw createError('Failed to send password reset email', 500);
    }
  },

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        throw createError('Token and new password are required', 400);
      }
      
      await authService.resetPassword(token, newPassword);
      
      res.status(200).json({
        success: true,
        message: 'Password reset successful'
      });
    } catch (error) {
      throw createError('Password reset failed', 400);
    }
  },

  async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user?.id;
      
      if (!currentPassword || !newPassword || !userId) {
        throw createError('Current password, new password are required', 400);
      }
      
      await authService.changePassword(userId, currentPassword, newPassword);
      
      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      throw createError('Password change failed', 400);
    }
  },

  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;
      
      if (!token) {
        throw createError('Verification token is required', 400);
      }
      
      await authService.verifyEmail(token);
      
      res.status(200).json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (error) {
      throw createError('Email verification failed', 400);
    }
  },

  async resendVerification(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      
      if (!email) {
        throw createError('Email is required', 400);
      }
      
      await authService.resendVerificationEmail(email);
      
      res.status(200).json({
        success: true,
        message: 'Verification email sent'
      });
    } catch (error) {
      throw createError('Failed to send verification email', 500);
    }
  },

  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        throw createError('User not authenticated', 401);
      }
      
      const profile = await authService.getUserProfile(userId);
      
      res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      throw createError('Failed to fetch profile', 500);
    }
  },

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const updates = req.body;
      
      if (!userId) {
        throw createError('User not authenticated', 401);
      }
      
      const updated = await authService.updateUserProfile(userId, updates);
      
      res.status(200).json({
        success: true,
        data: updated,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      throw createError('Failed to update profile', 500);
    }
  }
};