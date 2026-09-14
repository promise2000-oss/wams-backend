import prisma from '../../shared/db/prisma';
import { parsePagination, paginatedResponse } from '../../shared/lib/pagination';
import { notificationQueue } from '../../shared/queue/queues';
import { Request, Response } from 'express';

export async function listNotifications(req: Request, res: Response) {
  const { page, pageSize, skip } = parsePagination(req);

  const where = { userId: req.user!.id };

  const [total, notifications] = await Promise.all([
    prisma.notification.count({ where }),
    prisma.notification.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: pageSize,
    }),
  ]);

  const formatted = notifications.map((n: any) => ({
    id: n.id,
    organization_id: req.user!.organizationId,
    user_id: n.userId,
    type: n.type,
    title: n.title,
    message: n.message,
    data: n.data,
    delivery_channel: n.deliveryChannel,
    is_read: n.isRead,
    delivered_at: n.deliveredAt?.toISOString() || null,
    created_at: n.created_at.toISOString(),
  }));

  res.json(paginatedResponse(formatted, total, page, pageSize));
}

export async function markRead(req: Request, res: Response) {
  const notification = await prisma.notification.findFirst({
    where: { id: String(req.params.id), userId: req.user!.id },
  });

  if (!notification) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Notification not found', requestId: req.requestId },
    });
  }

  await prisma.notification.update({
    where: { id: String(req.params.id) },
    data: { isRead: true },
  });

  res.status(204).send();
}

export async function markAllRead(req: Request, res: Response) {
  await prisma.notification.updateMany({
    where: { userId: req.user!.id, isRead: false },
    data: { isRead: true },
  });

  res.status(204).send();
}

export async function getPreferences(req: Request, res: Response) {
  // For MVP, return default preferences
  const types = [
    'LATE_ARRIVAL', 'MISSED_CLOCK_OUT', 'LEAVE_APPROVAL', 'LEAVE_REJECTION',
    'SHIFT_ASSIGNMENT', 'SHIFT_CHANGE', 'CORRECTION_APPROVAL', 'CORRECTION_REJECTION',
    'DAILY_SUMMARY', 'ESCALATION',
  ];
  const channels = ['IN_APP', 'EMAIL'];

  const preferences = types.flatMap((type) =>
    channels.map((channel) => ({
      id: `${req.user!.id}-${type}-${channel}`,
      user_id: req.user!.id,
      type,
      channel,
      enabled: true,
      preference: type === 'DAILY_SUMMARY' ? 'DAILY_DIGEST' : 'IMMEDIATE',
    }))
  );

  res.json(preferences);
}

export async function updatePreferences(req: Request, res: Response) {
  // For MVP, just acknowledge
  res.json({ message: 'Preferences updated' });
}

export async function createNotification(data: {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  deliveryChannel?: string;
}) {
  return prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data || undefined,
      deliveryChannel: (data.deliveryChannel as any) || 'IN_APP',
      deliveredAt: new Date(),
    },
  });
}
