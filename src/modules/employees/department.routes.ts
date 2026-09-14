import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../shared/middleware/validation';
import { authenticate } from '../../shared/middleware/auth';
import { authorize } from '../../shared/middleware/rbac';
import * as departmentService from './department.service';

const router = Router();

const createDepartmentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  managerId: z.string().uuid().optional(),
});

const updateDepartmentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional().nullable(),
  managerId: z.string().uuid().optional().nullable(),
});

router.get('/', authenticate, authorize('employee.list'), departmentService.listDepartments);
router.post('/', authenticate, authorize('department.create'), validate(createDepartmentSchema), departmentService.createDepartment);
router.put('/:id', authenticate, authorize('department.update'), validate(updateDepartmentSchema), departmentService.updateDepartment);

export default router;
