import { Request, Response } from 'express';
import prisma from '../../shared/db/prisma';
import { parsePagination, paginatedResponse, parseFilters } from '../../shared/lib/pagination';

export async function listAuditLogs(req: Request, res: Response) {
  const { page, pageSize, skip } = parsePagination(req);
  const { dateFrom, dateTo, action, resourceType } = req.query;

  const where: any = {
    organizationId: req.user!.organizationId,
  };

  if (dateFrom || dateTo) {
    where.created_at = {};
    if (dateFrom) where.created_at.gte = new Date(dateFrom as string);
    if (dateTo) where.created_at.lte = new Date(dateTo as string);
  }
  if (action) where.action = action as string;
  if (resourceType) where.resourceType = resourceType as string;

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: pageSize,
    }),
  ]);

  res.json(paginatedResponse(logs, total, page, pageSize));
}

export async function createAuditLog(entry: {
  organizationId: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  ipAddress?: string;
}) {
  return prisma.auditLog.create({
    data: {
      organizationId: entry.organizationId,
      userId: entry.userId,
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      oldValue: entry.oldValue || undefined,
      newValue: entry.newValue || undefined,
      ipAddress: entry.ipAddress,
    },
  });
}

export function auditFromRequest(
  req: Request,
  action: string,
  resourceType: string,
  resourceId?: string,
  oldValue?: Record<string, any>,
  newValue?: Record<string, any>
) {
  return createAuditLog({
    organizationId: req.user!.organizationId,
    userId: req.user!.id,
    action,
    resourceType,
    resourceId,
    oldValue,
    newValue,
    ipAddress: req.ip,
  });
}
