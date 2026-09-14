import { Request, Response } from 'express';
export declare function listAuditLogs(req: Request, res: Response): Promise<void>;
export declare function createAuditLog(entry: {
    organizationId: string;
    userId: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    oldValue?: Record<string, any>;
    newValue?: Record<string, any>;
    ipAddress?: string;
}): Promise<{
    userId: string;
    action: string;
    id: string;
    created_at: Date;
    organizationId: string;
    resourceType: string;
    resourceId: string | null;
    oldValue: import("@prisma/client/runtime/library").JsonValue | null;
    newValue: import("@prisma/client/runtime/library").JsonValue | null;
    ipAddress: string | null;
}>;
export declare function auditFromRequest(req: Request, action: string, resourceType: string, resourceId?: string, oldValue?: Record<string, any>, newValue?: Record<string, any>): Promise<{
    userId: string;
    action: string;
    id: string;
    created_at: Date;
    organizationId: string;
    resourceType: string;
    resourceId: string | null;
    oldValue: import("@prisma/client/runtime/library").JsonValue | null;
    newValue: import("@prisma/client/runtime/library").JsonValue | null;
    ipAddress: string | null;
}>;
//# sourceMappingURL=audit.service.d.ts.map