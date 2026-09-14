"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listNotifications = listNotifications;
exports.markRead = markRead;
exports.markAllRead = markAllRead;
exports.getPreferences = getPreferences;
exports.updatePreferences = updatePreferences;
exports.createNotification = createNotification;
const prisma_1 = __importDefault(require("../../shared/db/prisma"));
const pagination_1 = require("../../shared/lib/pagination");
async function listNotifications(req, res) {
    const { page, pageSize, skip } = (0, pagination_1.parsePagination)(req);
    const where = { userId: req.user.id };
    const [total, notifications] = await Promise.all([
        prisma_1.default.notification.count({ where }),
        prisma_1.default.notification.findMany({
            where,
            orderBy: { created_at: 'desc' },
            skip,
            take: pageSize,
        }),
    ]);
    const formatted = notifications.map((n) => ({
        id: n.id,
        organization_id: req.user.organizationId,
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
    res.json((0, pagination_1.paginatedResponse)(formatted, total, page, pageSize));
}
async function markRead(req, res) {
    const notification = await prisma_1.default.notification.findFirst({
        where: { id: String(req.params.id), userId: req.user.id },
    });
    if (!notification) {
        return res.status(404).json({
            error: { code: 'NOT_FOUND', message: 'Notification not found', requestId: req.requestId },
        });
    }
    await prisma_1.default.notification.update({
        where: { id: String(req.params.id) },
        data: { isRead: true },
    });
    res.status(204).send();
}
async function markAllRead(req, res) {
    await prisma_1.default.notification.updateMany({
        where: { userId: req.user.id, isRead: false },
        data: { isRead: true },
    });
    res.status(204).send();
}
async function getPreferences(req, res) {
    // For MVP, return default preferences
    const types = [
        'LATE_ARRIVAL', 'MISSED_CLOCK_OUT', 'LEAVE_APPROVAL', 'LEAVE_REJECTION',
        'SHIFT_ASSIGNMENT', 'SHIFT_CHANGE', 'CORRECTION_APPROVAL', 'CORRECTION_REJECTION',
        'DAILY_SUMMARY', 'ESCALATION',
    ];
    const channels = ['IN_APP', 'EMAIL'];
    const preferences = types.flatMap((type) => channels.map((channel) => ({
        id: `${req.user.id}-${type}-${channel}`,
        user_id: req.user.id,
        type,
        channel,
        enabled: true,
        preference: type === 'DAILY_SUMMARY' ? 'DAILY_DIGEST' : 'IMMEDIATE',
    })));
    res.json(preferences);
}
async function updatePreferences(req, res) {
    // For MVP, just acknowledge
    res.json({ message: 'Preferences updated' });
}
async function createNotification(data) {
    return prisma_1.default.notification.create({
        data: {
            userId: data.userId,
            type: data.type,
            title: data.title,
            message: data.message,
            data: data.data || undefined,
            deliveryChannel: data.deliveryChannel || 'IN_APP',
            deliveredAt: new Date(),
        },
    });
}
//# sourceMappingURL=notification.service.js.map