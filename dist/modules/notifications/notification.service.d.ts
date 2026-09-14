import { Request, Response } from 'express';
export declare function listNotifications(req: Request, res: Response): Promise<void>;
export declare function markRead(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function markAllRead(req: Request, res: Response): Promise<void>;
export declare function getPreferences(req: Request, res: Response): Promise<void>;
export declare function updatePreferences(req: Request, res: Response): Promise<void>;
export declare function createNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
    deliveryChannel?: string;
}): Promise<{
    message: string;
    userId: string;
    type: string;
    id: string;
    created_at: Date;
    data: import("@prisma/client/runtime/library").JsonValue | null;
    title: string;
    deliveryChannel: import(".prisma/client").$Enums.DeliveryChannel;
    isRead: boolean;
    deliveredAt: Date | null;
}>;
//# sourceMappingURL=notification.service.d.ts.map