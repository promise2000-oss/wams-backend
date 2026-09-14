import { Request, Response } from 'express';
export declare function clockIn(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function clockOut(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getTodayStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getAttendanceHistory(req: Request, res: Response): Promise<void>;
export declare function submitCorrection(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getCorrections(req: Request, res: Response): Promise<void>;
export declare function reviewCorrection(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getTeamLive(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=attendance.service.d.ts.map