import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../shared/middleware/validation';
import { authenticate } from '../../shared/middleware/auth';
import { authorize } from '../../shared/middleware/rbac';
import * as leaveService from './leave.service';

const router = Router();

const createLeaveTypeSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  days_per_year: z.number().min(0).max(365).optional(),
  accrual_policy: z.any().optional(),
  carry_over_max_days: z.number().min(0).max(365).optional(),
});

const updateLeaveTypeSchema = createLeaveTypeSchema.partial().extend({ is_active: z.boolean().optional() });

const createLeaveRequestSchema = z.object({
  leave_type_id: z.string().uuid(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  is_half_day: z.boolean().optional(),
  half_day_period: z.enum(['AM', 'PM']).optional(),
  reason: z.string().min(1).max(500),
  document_url: z.string().optional(),
});

const approveSchema = z.object({ notes: z.string().optional() });
const rejectSchema = z.object({ reason: z.string().min(1) });
const bulkApproveSchema = z.object({ ids: z.array(z.string().uuid()).min(1) });
const delegateSchema = z.object({
  delegate_id: z.string().uuid(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

router.get('/types', authenticate, leaveService.listLeaveTypes);
router.post('/types', authenticate, authorize('leave.manageTypes'), validate(createLeaveTypeSchema), leaveService.createLeaveType);
router.put('/types/:id', authenticate, authorize('leave.manageTypes'), validate(updateLeaveTypeSchema), leaveService.updateLeaveType);

router.get('/balance', authenticate, leaveService.getLeaveBalance);

router.get('/requests', authenticate, leaveService.listLeaveRequests);
router.post('/requests', authenticate, authorize('leave.create'), validate(createLeaveRequestSchema), leaveService.createLeaveRequest);
router.post('/requests/:id/approve', authenticate, authorize('leave.approve'), validate(approveSchema), leaveService.approveLeaveRequest);
router.post('/requests/:id/reject', authenticate, authorize('leave.reject'), validate(rejectSchema), leaveService.rejectLeaveRequest);
router.post('/requests/bulk-approve', authenticate, authorize('leave.bulkApprove'), validate(bulkApproveSchema), leaveService.bulkApproveLeave);

router.get('/approvers/delegate', authenticate, leaveService.listDelegates);
router.post('/approvers/delegate', authenticate, authorize('leave.delegate'), validate(delegateSchema), leaveService.createDelegate);
router.delete('/approvers/delegate/:id', authenticate, authorize('leave.delegate'), leaveService.removeDelegate);

export default router;
