import prisma from '../../shared/db/prisma';
import { parsePagination, paginatedResponse, parseFilters } from '../../shared/lib/pagination';
import { auditFromRequest } from '../audit/audit.service';
import { Request, Response } from 'express';

function formatDepartment(dept: any) {
  return {
    id: dept.id,
    organization_id: dept.organizationId,
    name: dept.name,
    description: dept.description,
    manager_id: dept.managerId,
    employee_count: dept._count?.users,
    created_at: dept.created_at.toISOString(),
    updated_at: dept.updated_at.toISOString(),
  };
}

export async function listDepartments(req: Request, res: Response) {
  const { page, pageSize, skip } = parsePagination(req);

  const where: any = {
    organizationId: req.user!.organizationId,
  };

  const [total, departments] = await Promise.all([
    prisma.department.count({ where }),
    prisma.department.findMany({
      where,
      include: { _count: { select: { users: true } } },
      orderBy: { name: 'asc' },
      skip,
      take: pageSize,
    }),
  ]);

  res.json(paginatedResponse(departments.map(formatDepartment), total, page, pageSize));
}

export async function createDepartment(req: Request, res: Response) {
  const { name, description, managerId } = req.body;

  const existing = await prisma.department.findFirst({
    where: { name, organizationId: req.user!.organizationId },
  });
  if (existing) {
    return res.status(409).json({
      error: { code: 'DUPLICATE', message: 'A department with this name already exists', requestId: req.requestId },
    });
  }

  const department = await prisma.department.create({
    data: {
      organizationId: req.user!.organizationId,
      name,
      description,
      managerId,
    },
    include: { _count: { select: { users: true } } },
  });

  await auditFromRequest(req, 'CREATE', 'Department', department.id, undefined, formatDepartment(department));

  res.status(201).json(formatDepartment(department));
}

export async function updateDepartment(req: Request, res: Response) {
  const { name, description, managerId } = req.body;

  const existing = await prisma.department.findFirst({
    where: { id: String(req.params.id), organizationId: req.user!.organizationId },
  });
  if (!existing) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Department not found', requestId: req.requestId },
    });
  }

  const updated = await prisma.department.update({
    where: { id: String(req.params.id) },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(managerId !== undefined && { managerId }),
    },
    include: { _count: { select: { users: true } } },
  });

  await auditFromRequest(req, 'UPDATE', 'Department', updated.id, formatDepartment(existing), formatDepartment(updated));

  res.json(formatDepartment(updated));
}
