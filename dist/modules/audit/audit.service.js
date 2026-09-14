"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAuditLogs = listAuditLogs;
exports.createAuditLog = createAuditLog;
exports.auditFromRequest = auditFromRequest;
const prisma_1 = __importDefault(require("../../shared/db/prisma"));
const pagination_1 = require("../../shared/lib/pagination");
async function listAuditLogs(req, res) {
    const { page, pageSize, skip } = (0, pagination_1.parsePagination)(req);
    const { dateFrom, dateTo, action, resourceType } = req.query;
    const where = {
        organizationId: req.user.organizationId,
    };
    if (dateFrom || dateTo) {
        where.created_at = {};
        if (dateFrom)
            where.created_at.gte = new Date(dateFrom);
        if (dateTo)
            where.created_at.lte = new Date(dateTo);
    }
    if (action)
        where.action = action;
    if (resourceType)
        where.resourceType = resourceType;
    const [total, logs] = await Promise.all([
        prisma_1.default.auditLog.count({ where }),
        prisma_1.default.auditLog.findMany({
            where,
            orderBy: { created_at: 'desc' },
            skip,
            take: pageSize,
        }),
    ]);
    res.json((0, pagination_1.paginatedResponse)(logs, total, page, pageSize));
}
async function createAuditLog(entry) {
    return prisma_1.default.auditLog.create({
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
function auditFromRequest(req, action, resourceType, resourceId, oldValue, newValue) {
    return createAuditLog({
        organizationId: req.user.organizationId,
        userId: req.user.id,
        action,
        resourceType,
        resourceId,
        oldValue,
        newValue,
        ipAddress: req.ip,
    });
}
//# sourceMappingURL=audit.service.js.map