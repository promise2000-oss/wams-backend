import { Request, Response } from 'express';
export declare function listShifts(req: Request, res: Response): Promise<void>;
export declare function getShift(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function createShift(req: Request, res: Response): Promise<void>;
export declare function updateShift(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function archiveShift(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function listShiftAssignments(req: Request, res: Response): Promise<void>;
export declare function createShiftAssignment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getShiftChangeHistory(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=shift.service.d.ts.map