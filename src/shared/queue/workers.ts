import { Worker, Job } from 'bullmq';
import { DateTime } from 'luxon';
import prisma from '../db/prisma';
import { createNotification } from '../../modules/notifications/notification.service';
import logger from '../lib/logger';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

// ── Notifications Worker ──

const notificationWorker = new Worker('notifications', async (job: Job) => {
  const { userId, type, title, message, data, deliveryChannel } = job.data;
  logger.info(`[Notification] Processing ${type} for user ${userId}`);

  await createNotification({ userId, type, title, message, data, deliveryChannel });
}, { connection });

notificationWorker.on('failed', (job, err) => {
  logger.error(`[Notification] Job ${job?.id} failed: ${err.message}`);
});

// ── Auto-Absent Worker ──

const autoAbsentWorker = new Worker('auto-absent', async (job: Job) => {
  const { organizationId, workDate } = job.data;
  logger.info(`[AutoAbsent] Processing org ${organizationId} for ${workDate}`);

  const org = await prisma.organization.findUnique({ where: { id: organizationId } });
  if (!org) return;

  const timezone = org.timezone;
  const nowInTz = DateTime.now().setZone(timezone);

  // Get all active employees with shifts
  const employees = await prisma.user.findMany({
    where: { organizationId, status: 'ACTIVE', shiftId: { not: null } },
    include: { shift: true },
  });

  for (const emp of employees) {
    if (!emp.shift) continue;

    // Check if already has attendance for this date
    const existing = await prisma.attendance.findUnique({
      where: { employeeId_workDate: { employeeId: emp.id, workDate: new Date(workDate) } },
    });

    if (existing) continue;

    // Check for approved leave
    const hasLeave = await prisma.leaveRequest.findFirst({
      where: {
        employeeId: emp.id,
        status: 'APPROVED',
        startDate: { lte: new Date(workDate) },
        endDate: { gte: new Date(workDate) },
      },
    });

    if (hasLeave) continue;

    // Check if working day
    const workDateDt = DateTime.fromISO(workDate).setZone(timezone);
    const dayOfWeek = workDateDt.weekday % 7;
    const workingDays = emp.shift.workingDays.split(',').map(Number);
    if (!workingDays.includes(dayOfWeek)) continue;

    // Create absent record
    const [startH, startM] = emp.shift.startTime.split(':').map(Number);
    const [endH, endM] = emp.shift.endTime.split(':').map(Number);
    const crossesMidnight = endH < startH;

    const scheduledStart = workDateDt.set({ hour: startH, minute: startM, second: 0, millisecond: 0 });
    let scheduledEnd = workDateDt.set({ hour: endH, minute: endM, second: 0, millisecond: 0 });
    if (crossesMidnight) scheduledEnd = scheduledEnd.plus({ days: 1 });

    await prisma.attendance.create({
      data: {
        organizationId,
        employeeId: emp.id,
        shiftId: emp.shift.id,
        workDate: new Date(workDate),
        scheduledStart: scheduledStart.toISO()!,
        scheduledEnd: scheduledEnd.toISO()!,
        status: 'ABSENT',
        source: 'SYSTEM_AUTO_ABSENT',
      },
    });
  }
}, { connection });

autoAbsentWorker.on('failed', (job, err) => {
  logger.error(`[AutoAbsent] Job ${job?.id} failed: ${err.message}`);
});

// ── Analytics Aggregation Worker ──

const analyticsWorker = new Worker('analytics-aggregation', async (job: Job) => {
  const { organizationId } = job.data;
  logger.info(`[Analytics] Aggregating for org ${organizationId}`);

  // Pre-compute dashboard metrics for faster page loads
  // This runs hourly and stores results in a cache/table
}, { connection });

analyticsWorker.on('failed', (job, err) => {
  logger.error(`[Analytics] Job ${job?.id} failed: ${err.message}`);
});

// ── Leave Accrual Worker ──

const leaveAccrualWorker = new Worker('leave-accrual', async (job: Job) => {
  const { organizationId } = job.data;
  logger.info(`[LeaveAccrual] Processing accrual for org ${organizationId}`);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const leaveTypes = await prisma.leaveType.findMany({
    where: { organizationId, status: 'ACTIVE' },
  });

  const employees = await prisma.user.findMany({
    where: { organizationId, status: 'ACTIVE' },
  });

  for (const lt of leaveTypes) {
    const policy = lt.accrualPolicy as any;
    if (!policy || policy.type === 'none') continue;

    let accrualAmount = 0;
    if (policy.type === 'monthly') {
      accrualAmount = Math.round((lt.defaultDays / 12) * 100) / 100;
    } else if (policy.type === 'quarterly') {
      if (currentMonth % 3 === 0) {
        accrualAmount = lt.defaultDays / 4;
      }
    }

    if (accrualAmount <= 0) continue;

    for (const emp of employees) {
      const balance = await prisma.leaveBalance.findFirst({
        where: {
          employeeId: emp.id,
          leaveTypeId: lt.id,
          periodYear: currentYear,
        },
      });

      if (balance) {
        await prisma.leaveBalance.update({
          where: { id: balance.id },
          data: { allocatedDays: balance.allocatedDays + accrualAmount },
        });
      } else {
        await prisma.leaveBalance.create({
          data: {
            employeeId: emp.id,
            leaveTypeId: lt.id,
            periodYear: currentYear,
            allocatedDays: accrualAmount,
            usedDays: 0,
            remainingDays: accrualAmount,
          },
        });
      }
    }
  }
}, { connection });

leaveAccrualWorker.on('failed', (job, err) => {
  logger.error(`[LeaveAccrual] Job ${job?.id} failed: ${err.message}`);
});

// ── Reports Worker ──

const reportsWorker = new Worker('reports', async (job: Job) => {
  const { organizationId, userId, type, filters } = job.data;
  logger.info(`[Reports] Generating ${type} report for org ${organizationId}`);

  // Generate CSV/Excel/PDF based on type and filters
  // For MVP, just log the generation
}, { connection });

reportsWorker.on('failed', (job, err) => {
  logger.error(`[Reports] Job ${job?.id} failed: ${err.message}`);
});

// ── Escalation Check Worker ──

const escalationWorker = new Worker('escalation-check', async (job: Job) => {
  const { organizationId } = job.data;
  logger.info(`[Escalation] Checking escalations for org ${organizationId}`);

  // Check for pending corrections older than SLA
  const pendingCorrections = await prisma.attendanceCorrection.findMany({
    where: {
      organizationId,
      status: 'PENDING',
      created_at: { lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }, // 3 days
    },
    include: { employee: true },
  });

  for (const correction of pendingCorrections) {
    // Notify managers about overdue corrections
    const managers = await prisma.user.findMany({
      where: { organizationId, role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
    });

    for (const manager of managers) {
      await createNotification({
        userId: manager.id,
        type: 'ESCALATION',
        title: 'Overdue Correction Request',
        message: `A correction request from ${correction.employee.name} has been pending for over 3 days.`,
        data: { correctionId: correction.id, employeeId: correction.employeeId },
        deliveryChannel: 'IN_APP',
      });
    }
  }
}, { connection });

escalationWorker.on('failed', (job, err) => {
  logger.error(`[Escalation] Job ${job?.id} failed: ${err.message}`);
});

export {
  notificationWorker,
  autoAbsentWorker,
  analyticsWorker,
  leaveAccrualWorker,
  reportsWorker,
  escalationWorker,
};
