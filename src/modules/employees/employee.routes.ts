import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../shared/middleware/validation';
import { authenticate } from '../../shared/middleware/auth';
import { authorize } from '../../shared/middleware/rbac';
import * as employeeService from './employee.service';
import * as departmentService from './department.service';

const router = Router();

const createEmployeeSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128).optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE']).optional(),
  phone: z.string().optional(),
  departmentId: z.string().uuid().optional(),
  managerId: z.string().uuid().optional(),
  shiftId: z.string().uuid().optional(),
  position: z.string().optional(),
});

const updateEmployeeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE']).optional(),
  phone: z.string().optional(),
  departmentId: z.string().uuid().optional().nullable(),
  managerId: z.string().uuid().optional().nullable(),
  shiftId: z.string().uuid().optional().nullable(),
  position: z.string().optional().nullable(),
});

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

router.get('/', authenticate, authorize('employee.list'), employeeService.listEmployees);
router.get('/:id', authenticate, authorize('employee.list'), employeeService.getEmployee);
router.post('/', authenticate, authorize('employee.create'), validate(createEmployeeSchema), employeeService.createEmployee);
router.put('/:id', authenticate, authorize('employee.update'), validate(updateEmployeeSchema), employeeService.updateEmployee);
router.post('/:id/deactivate', authenticate, authorize('employee.deactivate'), employeeService.deactivateEmployee);
router.post('/:id/reactivate', authenticate, authorize('employee.reactivate'), employeeService.reactivateEmployee);

export default router;
