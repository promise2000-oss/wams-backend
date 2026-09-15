"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const luxon_1 = require("luxon");
const prisma_1 = __importDefault(require("../db/prisma"));
const notification_service_1 = require("../../modules/notifications/notification.service");
const logger_1 = __importDefault(require("../lib/logger"));
const redis_1 = __importDefault(require("../redis"));
if (!redis_1.default) {
    logger_1.default.warn('[Workers] Redis not available — background jobs disabled');
}
else {
    const connection = {
        host: redis_1.default.options.host || 'localhost',
        port: redis_1.default.options.port || 6379,
    };
    // ── Notifications Worker ──
    const notificationWorker = new bullmq_1.Worker('notifications', async (job) => {
        const { userId, type, title, message, data, deliveryChannel } = job.data;
        logger_1.default.info(`[Notification] Processing ${type} for user ${userId}`);
        await (0, notification_service_1.createNotification)({ userId, type, title, message, data, deliveryChannel });
    }, { connection });
    notificationWorker.on('failed', (job, err) => {
        logger_1.default.error(`[Notification] Job ${job?.id} failed: ${err.message}`);
    });
    // ── Auto-Absent Worker ──
    const autoAbsentWorker = new bullmq_1.Worker('auto-absent', async (job) => {
        const { organizationId, workDate } = job.data;
        logger_1.default.info(`[AutoAbsent] Processing org ${organizationId} for ${workDate}`);
        const org = await prisma_1.default.organization.findUnique({ where: { id: organizationId } });
        if (!org)
            return;
        const timezone = org.timezone;
        const workDateDt = luxon_1.DateTime.fromISO(workDate).setZone(timezone);
        const employees = await prisma_1.default.user.findMany({
            where: { organizationId, status: 'ACTIVE', shiftId: { not: null } },
            include: { shift: true },
        });
        for (const emp of employees) {
            if (!emp.shift)
                continue;
            const existing = await prisma_1.default.attendance.findUnique({
                where: { employeeId_workDate: { employeeId: emp.id, workDate: new Date(workDate) } },
            });
            if (existing)
                continue;
            const hasLeave = await prisma_1.default.leaveRequest.findFirst({
                where: {
                    employeeId: emp.id,
                    status: 'APPROVED',
                    startDate: { lte: new Date(workDate) },
                    endDate: { gte: new Date(workDate) },
                },
            });
            if (hasLeave)
                continue;
            const dayOfWeek = workDateDt.weekday % 7;
            const workingDays = emp.shift.workingDays.split(',').map(Number);
            if (!workingDays.includes(dayOfWeek))
                continue;
            const [startH, startM] = emp.shift.startTime.split(':').map(Number);
            const [endH, endM] = emp.shift.endTime.split(':').map(Number);
            const crossesMidnight = endH < startH;
            const scheduledStart = workDateDt.set({ hour: startH, minute: startM, second: 0, millisecond: 0 });
            let scheduledEnd = workDateDt.set({ hour: endH, minute: endM, second: 0, millisecond: 0 });
            if (crossesMidnight)
                scheduledEnd = scheduledEnd.plus({ days: 1 });
            await prisma_1.default.attendance.create({
                data: {
                    organizationId,
                    employeeId: emp.id,
                    shiftId: emp.shift.id,
                    workDate: new Date(workDate),
                    scheduledStart: scheduledStart.toISO(),
                    scheduledEnd: scheduledEnd.toISO(),
                    status: 'ABSENT',
                    source: 'SYSTEM_AUTO_ABSENT',
                },
            });
        }
    }, { connection });
    autoAbsentWorker.on('failed', (job, err) => {
        logger_1.default.error(`[AutoAbsent] Job ${job?.id} failed: ${err.message}`);
    });
    // ── Analytics Aggregation Worker ──
    const analyticsWorker = new bullmq_1.Worker('analytics-aggregation', async (job) => {
        const { organizationId } = job.data;
        logger_1.default.info(`[Analytics] Aggregating for org ${organizationId}`);
    }, { connection });
    analyticsWorker.on('failed', (job, err) => {
        logger_1.default.error(`[Analytics] Job ${job?.id} failed: ${err.message}`);
    });
    // ── Leave Accrual Worker ──
    const leaveAccrualWorker = new bullmq_1.Worker('leave-accrual', async (job) => {
        const { organizationId } = job.data;
        logger_1.default.info(`[LeaveAccrual] Processing accrual for org ${organizationId}`);
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const leaveTypes = await prisma_1.default.leaveType.findMany({
            where: { organizationId, status: 'ACTIVE' },
        });
        const employees = await prisma_1.default.user.findMany({
            where: { organizationId, status: 'ACTIVE' },
        });
        for (const lt of leaveTypes) {
            const policy = lt.accrualPolicy;
            if (!policy || policy.type === 'none')
                continue;
            let accrualAmount = 0;
            if (policy.type === 'monthly') {
                accrualAmount = Math.round((lt.defaultDays / 12) * 100) / 100;
            }
            else if (policy.type === 'quarterly') {
                if (currentMonth % 3 === 0)
                    accrualAmount = lt.defaultDays / 4;
            }
            if (accrualAmount <= 0)
                continue;
            for (const emp of employees) {
                const balance = await prisma_1.default.leaveBalance.findFirst({
                    where: { employeeId: emp.id, leaveTypeId: lt.id, periodYear: currentYear },
                });
                if (balance) {
                    await prisma_1.default.leaveBalance.update({
                        where: { id: balance.id },
                        data: { allocatedDays: balance.allocatedDays + accrualAmount },
                    });
                }
                else {
                    await prisma_1.default.leaveBalance.create({
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
        logger_1.default.error(`[LeaveAccrual] Job ${job?.id} failed: ${err.message}`);
    });
    // ── Reports Worker ──
    const reportsWorker = new bullmq_1.Worker('reports', async (job) => {
        const { organizationId, type } = job.data;
        logger_1.default.info(`[Reports] Generating ${type} report for org ${organizationId}`);
    }, { connection });
    reportsWorker.on('failed', (job, err) => {
        logger_1.default.error(`[Reports] Job ${job?.id} failed: ${err.message}`);
    });
    // ── Escalation Check Worker ──
    const escalationWorker = new bullmq_1.Worker('escalation-check', async (job) => {
        const { organizationId } = job.data;
        logger_1.default.info(`[Escalation] Checking escalations for org ${organizationId}`);
        const pendingCorrections = await prisma_1.default.attendanceCorrection.findMany({
            where: {
                organizationId,
                status: 'PENDING',
                created_at: { lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
            },
            include: { employee: true },
        });
        for (const correction of pendingCorrections) {
            const managers = await prisma_1.default.user.findMany({
                where: { organizationId, role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
            });
            for (const manager of managers) {
                await (0, notification_service_1.createNotification)({
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
        logger_1.default.error(`[Escalation] Job ${job?.id} failed: ${err.message}`);
    });
}
//# sourceMappingURL=workers.js.map