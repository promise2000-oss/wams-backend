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
export declare function createAuditLog(entry: AuditLogEntry): Promise<void>;
export declare function auditFromRequest(req: Request, action: string, resourceType: string, resourceId?: string, oldValue?: Record<string, any>, newValue?: Record<string, any>): Promise<void>;
export {};
//# sourceMappingURL=audit.d.ts.map