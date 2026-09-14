import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../shared/middleware/validation';
import { authenticate } from '../../shared/middleware/auth';
import { authorize } from '../../shared/middleware/rbac';
import * as reportService from './report.service';

const router = Router();

const generateReportSchema = z.object({
  type: z.enum(['ATTENDANCE', 'LEAVE', 'SHIFT']),
  filters: z.record(z.any()),
});

router.get('/', authenticate, authorize('reports.view'), reportService.listReports);
router.post('/', authenticate, authorize('reports.generate'), validate(generateReportSchema), reportService.generateReport);
router.get('/:id/download', authenticate, authorize('reports.download'), reportService.downloadReport);

export default router;
