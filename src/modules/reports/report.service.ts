import prisma from '../../shared/db/prisma';
import { reportsQueue } from '../../shared/queue/queues';
import { parsePagination, paginatedResponse } from '../../shared/lib/pagination';
import { auditFromRequest } from '../audit/audit.service';
import { Request, Response } from 'express';

export async function generateReport(req: Request, res: Response) {
  const { type, filters } = req.body;

  const job = await reportsQueue.add('generate-report', {
    organizationId: req.user!.organizationId,
    userId: req.user!.id,
    type,
    filters,
  });

  await auditFromRequest(req, 'GENERATE', 'Report', job.id);

  res.status(202).json({
    id: `RPT-${job.id}`,
    type,
    status: 'PENDING',
    filters,
    generated_by: req.user!.id,
    created_at: new Date().toISOString(),
  });
}

export async function listReports(req: Request, res: Response) {
  const { page, pageSize, skip } = parsePagination(req);

  // For MVP, return empty list - reports tracked in a table later
  res.json(paginatedResponse([], 0, page, pageSize));
}

export async function downloadReport(req: Request, res: Response) {
  // For MVP, return placeholder
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: 'Report not found or still generating', requestId: req.requestId },
  });
}
