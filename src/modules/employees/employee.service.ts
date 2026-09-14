import bcrypt from 'bcrypt';
import prisma from '../../shared/db/prisma';
import { parsePagination, paginatedResponse, parseFilters } from '../../shared/lib/pagination';
import { auditFromRequest } from '../audit/audit.service';
import { Request, Response } from 'express';

const BCRYPT_COST = 12;

function formatUser(user: any) {
  return {
    id: user.id,
    organization_id: user.organizationId,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    employee_id: user.employeeId,
    department_id: user.departmentId,
    manager_id: user.managerId,
    shift_id: user.shiftId,
    position: user.position,
    employment_status: user.status,
    date_joined: user.dateJoined?.toISOString() || null,
    avatar_url: user.avatarUrl,
    department_name: user.department?.name,
    manager_name: user.manager?.name,
    created_at: user.created_at.toISOString(),
    updated_at: user.updated_at.toISOString(),
  };
}

export async function listEmployees(req: Request, res: Response) {
  const { page, pageSize, skip } = parsePagination(req);
  const { departmentId, shiftId, status, search } = parseFilters(req);

  const where: any = {
    organizationId: req.user!.organizationId,
  };

  if (departmentId) where.departmentId = departmentId;
  if (shiftId) where.shiftId = shiftId;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { employeeId: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      include: { department: true, manager: true },
      orderBy: { name: 'asc' },
      skip,
      take: pageSize,
    }),
  ]);

  res.json(paginatedResponse(users.map(formatUser), total, page, pageSize));
}

export async function getEmployee(req: Request, res: Response) {
  const user = await prisma.user.findFirst({
    where: { id: String(req.params.id), organizationId: req.user!.organizationId },
    include: { department: true, manager: true },
  });

  if (!user) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Employee not found', requestId: req.requestId },
    });
  }

  res.json(formatUser(user));
}

export async function createEmployee(req: Request, res: Response) {
  const { name, email, password, role, phone, departmentId, managerId, shiftId, position } = req.body;

  const existingUser = await prisma.user.findFirst({
    where: { email, organizationId: req.user!.organizationId },
  });
  if (existingUser) {
    return res.status(409).json({
      error: { code: 'EMAIL_EXISTS', message: 'A user with this email already exists', requestId: req.requestId },
    });
  }

  const passwordHash = await bcrypt.hash(password || 'changeme123', BCRYPT_COST);

  const user = await prisma.user.create({
    data: {
      organizationId: req.user!.organizationId,
      name,
      email,
      passwordHash,
      role: role || 'EMPLOYEE',
      phone,
      departmentId,
      managerId,
      shiftId,
      position,
      status: 'ACTIVE',
    },
    include: { department: true, manager: true },
  });

  await auditFromRequest(req, 'CREATE', 'Employee', user.id, undefined, formatUser(user));

  res.status(201).json(formatUser(user));
}

export async function updateEmployee(req: Request, res: Response) {
  const { name, email, role, phone, departmentId, managerId, shiftId, position } = req.body;

  const existing = await prisma.user.findFirst({
    where: { id: String(req.params.id), organizationId: req.user!.organizationId },
  });
  if (!existing) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Employee not found', requestId: req.requestId },
    });
  }

  const updated = await prisma.user.update({
    where: { id: String(req.params.id) },
    data: {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(role !== undefined && { role }),
      ...(phone !== undefined && { phone }),
      ...(departmentId !== undefined && { departmentId }),
      ...(managerId !== undefined && { managerId }),
      ...(shiftId !== undefined && { shiftId }),
      ...(position !== undefined && { position }),
    },
    include: { department: true, manager: true },
  });

  await auditFromRequest(req, 'UPDATE', 'Employee', updated.id, formatUser(existing), formatUser(updated));

  res.json(formatUser(updated));
}

export async function deactivateEmployee(req: Request, res: Response) {
  const existing = await prisma.user.findFirst({
    where: { id: String(req.params.id), organizationId: req.user!.organizationId },
  });
  if (!existing) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Employee not found', requestId: req.requestId },
    });
  }

  const updated = await prisma.user.update({
    where: { id: String(req.params.id) },
    data: { status: 'DEACTIVATED' },
    include: { department: true, manager: true },
  });

  await auditFromRequest(req, 'DEACTIVATE', 'Employee', updated.id, formatUser(existing), formatUser(updated));

  res.json(formatUser(updated));
}

export async function reactivateEmployee(req: Request, res: Response) {
  const existing = await prisma.user.findFirst({
    where: { id: String(req.params.id), organizationId: req.user!.organizationId },
  });
  if (!existing) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Employee not found', requestId: req.requestId },
    });
  }

  const updated = await prisma.user.update({
    where: { id: String(req.params.id) },
    data: { status: 'ACTIVE' },
    include: { department: true, manager: true },
  });

  await auditFromRequest(req, 'REACTIVATE', 'Employee', updated.id, formatUser(existing), formatUser(updated));

  res.json(formatUser(updated));
}
