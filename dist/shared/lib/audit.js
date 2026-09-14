"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuditLog = createAuditLog;
exports.auditFromRequest = auditFromRequest;
const prisma_1 = __importDefault(require("../db/prisma"));
async function createAuditLog(entry) {
    try {
        await prisma_1.default.auditLog.create({
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
    catch (err) {
        console.error('[Audit] Failed to create audit log:', err);
    }
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
//# sourceMappingURL=audit.js.map