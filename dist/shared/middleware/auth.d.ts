import { Request, Response, NextFunction } from 'express';
export declare function authenticate(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function generateAccessToken(user: {
    id: string;
    organizationId: string;
    email: string;
    name: string;
    role: string;
    departmentId?: string | null;
    managerId?: string | null;
}): string;
//# sourceMappingURL=auth.d.ts.map