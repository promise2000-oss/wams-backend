import { Request, Response, NextFunction } from 'express';
declare const ROLE_HIERARCHY: Record<string, number>;
type ScopeChecker = (user: Request['user'], resource: any) => boolean;
interface Policy {
    roles: string[];
    scope?: ScopeChecker;
}
declare const policies: Record<string, Policy>;
export declare function authorize(action: string, resourceProvider?: (req: Request) => any): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export { ROLE_HIERARCHY, policies };
//# sourceMappingURL=rbac.d.ts.map