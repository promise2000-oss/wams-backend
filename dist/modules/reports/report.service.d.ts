import { Request, Response } from 'express';
export declare function generateReport(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function listReports(req: Request, res: Response): Promise<void>;
export declare function downloadReport(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=report.service.d.ts.map