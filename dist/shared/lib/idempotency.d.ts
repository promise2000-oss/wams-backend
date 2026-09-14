import { Request, Response, NextFunction } from 'express';
export declare function checkIdempotency(key: string): Promise<{
    exists: boolean;
    response?: any;
}>;
export declare function storeIdempotencyResponse(key: string, response: any): Promise<void>;
export declare function idempotencyMiddleware(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=idempotency.d.ts.map