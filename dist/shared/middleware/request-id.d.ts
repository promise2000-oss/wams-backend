import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            requestId: string;
            user?: {
                id: string;
                organizationId: string;
                email: string;
                name: string;
                role: string;
                departmentId?: string | null;
                managerId?: string | null;
            };
        }
    }
}
export declare function requestIdMiddleware(req: Request, _res: Response, next: NextFunction): void;
//# sourceMappingURL=request-id.d.ts.map