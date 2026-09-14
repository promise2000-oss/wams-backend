import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../shared/middleware/validation';
import { authenticate } from '../../shared/middleware/auth';
import { authorize } from '../../shared/middleware/rbac';
import { idempotencyMiddleware } from '../../shared/lib/idempotency';
import * as attendanceService from './attendance.service';

const router = Router();

const clockInSchema = z.object({
  notes: z.string().optional(),
});

const clockOutSchema = z.object({
  notes: z.string().optional(),
});

const submitCorrectionSchema = z.object({
  attendance_id: z.string().uuid(),
  requested_clock_in: z.string().datetime(),
  requested_clock_out: z.string().datetime(),
  reason: z.string().min(1).max(500),
});

const reviewCorrectionSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  review_notes: z.string().optional(),
});

router.post('/clock-in', authenticate, authorize('attendance.clockIn'), idempotencyMiddleware, validate(clockInSchema), attendanceService.clockIn);
router.post('/clock-out', authenticate, authorize('attendance.clockOut'), idempotencyMiddleware, validate(clockOutSchema), attendanceService.clockOut);
router.get('/today', authenticate, attendanceService.getTodayStatus);
router.get('/history', authenticate, authorize('attendance.history'), attendanceService.getAttendanceHistory);
router.get('/team-live', authenticate, authorize('attendance.teamLive'), attendanceService.getTeamLive);
router.post('/corrections', authenticate, authorize('attendance.correction.submit'), validate(submitCorrectionSchema), attendanceService.submitCorrection);
router.get('/corrections', authenticate, authorize('attendance.view'), attendanceService.getCorrections);
router.post('/corrections/:id/review', authenticate, authorize('attendance.correction.review'), validate(reviewCorrectionSchema), attendanceService.reviewCorrection);

export default router;
