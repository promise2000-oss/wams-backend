import { Request, Response } from 'express';
export declare function listLeaveTypes(req: Request, res: Response): Promise<void>;
export declare function createLeaveType(req: Request, res: Response): Promise<void>;
export declare function updateLeaveType(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getLeaveBalance(req: Request, res: Response): Promise<void>;
export declare function listLeaveRequests(req: Request, res: Response): Promise<void>;
export declare function createLeaveRequest(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function approveLeaveRequest(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function rejectLeaveRequest(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function bulkApproveLeave(req: Request, res: Response): Promise<void>;
export declare function listDelegates(req: Request, res: Response): Promise<void>;
export declare function createDelegate(req: Request, res: Response): Promise<void>;
export declare function removeDelegate(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=leave.service.d.ts.map