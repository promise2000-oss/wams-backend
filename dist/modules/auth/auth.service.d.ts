import { Request, Response } from 'express';
export declare function login(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function register(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function refresh(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function logout(req: Request, res: Response): Promise<void>;
export declare function logoutAll(req: Request, res: Response): Promise<void>;
export declare function me(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function forgotPassword(req: Request, res: Response): Promise<void>;
export declare function resetPassword(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function changePassword(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=auth.service.d.ts.map