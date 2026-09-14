import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../shared/middleware/validation';
import { authenticate } from '../../shared/middleware/auth';
import * as notificationService from './notification.service';

const router = Router();

const updatePreferencesSchema = z.object({
  preferences: z.array(z.object({
    type: z.string(),
    channel: z.string(),
    enabled: z.boolean(),
    preference: z.string().optional(),
  })),
});

router.get('/', authenticate, notificationService.listNotifications);
router.post('/:id/read', authenticate, notificationService.markRead);
router.post('/read-all', authenticate, notificationService.markAllRead);
router.get('/preferences', authenticate, notificationService.getPreferences);
router.put('/preferences', authenticate, validate(updatePreferencesSchema), notificationService.updatePreferences);

export default router;
