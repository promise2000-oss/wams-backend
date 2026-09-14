import prisma from '../db/prisma';
import { Request } from 'express';

interface AuditLogEntry {
  organizationId: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  ipAddress?: string;
}

export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
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
  } catch (err) {
    console.error('[Audit] Failed to create audit log:', err);
  }
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
