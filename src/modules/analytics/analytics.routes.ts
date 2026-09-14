import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../shared/middleware/validation';
import { authenticate } from '../../shared/middleware/auth';
import { authorize } from '../../shared/middleware/rbac';
import * as analyticsService from './analytics.service';

const router = Router();

const createSnapshotSchema = z.object({
  name: z.string().min(1).max(200),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

router.get('/dashboard', authenticate, authorize('analytics.view'), analyticsService.getDashboardMetrics);
router.get('/attendance', authenticate, authorize('analytics.view'), analyticsService.getAttendanceTrend);
router.get('/late-arrivals', authenticate, authorize('analytics.view'), analyticsService.getLateArrivalTrend);
router.get('/work-hours', authenticate, authorize('analytics.view'), analyticsService.getWorkHours);
router.get('/departments', authenticate, authorize('analytics.view'), analyticsService.getDepartmentComparison);
router.get('/anomalies', authenticate, authorize('analytics.view'), analyticsService.getAnomalies);
router.get('/benchmark', authenticate, authorize('analytics.view'), analyticsService.getBenchmark);
router.get('/snapshots', authenticate, authorize('analytics.view'), analyticsService.listSnapshots);
router.post('/snapshots', authenticate, authorize('analytics.snapshot.create'), validate(createSnapshotSchema), analyticsService.createSnapshot);

export default router;
