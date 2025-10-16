import { Router } from 'express';
import { authController } from '../controllers/authController';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';

const router = Router();

// Authentication endpoints
router.post('/register', validate(schemas.register), asyncHandler(authController.register));
router.post('/login', validate(schemas.login), asyncHandler(authController.login));
router.post('/logout', asyncHandler(authController.logout));
router.post('/refresh', asyncHandler(authController.refreshToken));

// Password management
router.post('/forgot-password', asyncHandler(authController.forgotPassword));
router.post('/reset-password', asyncHandler(authController.resetPassword));
router.post('/change-password', authenticate, validate(schemas.changePassword), asyncHandler(authController.changePassword));

// Email verification
router.post('/verify-email', asyncHandler(authController.verifyEmail));
router.post('/resend-verification', asyncHandler(authController.resendVerification));

// Profile management (requires authentication)
router.get('/profile', authenticate, asyncHandler(authController.getProfile));
router.put('/profile', authenticate, validate(schemas.userUpdate), asyncHandler(authController.updateProfile));

export default router;