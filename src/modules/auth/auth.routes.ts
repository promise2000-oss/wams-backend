import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../shared/middleware/validation';
import { authenticate } from '../../shared/middleware/auth';
import { authRateLimiter } from '../../shared/middleware/rate-limiter';
import * as authService from './auth.service';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  organizationName: z.string().min(1).max(200),
  timezone: z.string().optional(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

router.post('/login', authRateLimiter, validate(loginSchema), authService.login);
router.post('/register', validate(registerSchema), authService.register);
router.post('/refresh', authService.refresh);
router.post('/logout', authService.logout);
router.post('/logout-all', authenticate, authService.logoutAll);
router.get('/me', authenticate, authService.me);
router.post('/forgot-password', authRateLimiter, validate(forgotPasswordSchema), authService.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authService.resetPassword);
router.post('/change-password', authenticate, validate(changePasswordSchema), authService.changePassword);

export default router;
