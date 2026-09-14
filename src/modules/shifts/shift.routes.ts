import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../shared/middleware/validation';
import { authenticate } from '../../shared/middleware/auth';
import { authorize } from '../../shared/middleware/rbac';
import * as shiftService from './shift.service';

const router = Router();

const createShiftSchema = z.object({
  name: z.string().min(1).max(100),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
  grace_period_minutes: z.number().min(0).max(120).optional(),
  break_duration_minutes: z.number().min(0).max(120).optional(),
  working_days: z.array(z.number().min(0).max(6)).optional(),
  overtime_rules: z.object({
    max_overtime_minutes: z.number().min(0),
    rate_multiplier: z.number().min(1).max(5),
  }).optional(),
});

const updateShiftSchema = createShiftSchema.partial();

const createAssignmentSchema = z.object({
  shift_id: z.string().uuid(),
  employee_id: z.string().uuid(),
  effective_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  effective_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

router.get('/', authenticate, authorize('attendance.view'), shiftService.listShifts);
router.get('/:id', authenticate, authorize('attendance.view'), shiftService.getShift);
router.post('/', authenticate, authorize('shift.create'), validate(createShiftSchema), shiftService.createShift);
router.put('/:id', authenticate, authorize('shift.update'), validate(updateShiftSchema), shiftService.updateShift);
router.post('/:id/archive', authenticate, authorize('shift.archive'), shiftService.archiveShift);

router.get('/assignments/list', authenticate, authorize('attendance.view'), shiftService.listShiftAssignments);
router.post('/assignments', authenticate, authorize('shift.assign'), validate(createAssignmentSchema), shiftService.createShiftAssignment);

export default router;
