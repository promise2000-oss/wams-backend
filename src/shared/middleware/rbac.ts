import { Request, Response, NextFunction } from 'express';

const ROLE_HIERARCHY: Record<string, number> = {
  EMPLOYEE: 0,
  MANAGER: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

type ScopeChecker = (user: Request['user'], resource: any) => boolean;

interface Policy {
  roles: string[];
  scope?: ScopeChecker;
}

const policies: Record<string, Policy> = {
  'employee.create': { roles: ['ADMIN', 'SUPER_ADMIN'] },
  'employee.update': { roles: ['ADMIN', 'SUPER_ADMIN'] },
  'employee.deactivate': { roles: ['ADMIN', 'SUPER_ADMIN'] },
  'employee.reactivate': { roles: ['ADMIN', 'SUPER_ADMIN'] },
  'employee.list': { roles: ['ADMIN', 'SUPER_ADMIN', 'MANAGER'] },

  'department.create': { roles: ['ADMIN', 'SUPER_ADMIN'] },
  'department.update': { roles: ['ADMIN', 'SUPER_ADMIN'] },

  'shift.create': { roles: ['ADMIN', 'SUPER_ADMIN'] },
  'shift.update': { roles: ['ADMIN', 'SUPER_ADMIN'] },
  'shift.archive': { roles: ['ADMIN', 'SUPER_ADMIN'] },
  'shift.assign': { roles: ['ADMIN', 'SUPER_ADMIN', 'MANAGER'] },

  'attendance.clockIn': { roles: ['EMPLOYEE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
  'attendance.clockOut': { roles: ['EMPLOYEE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
  'attendance.view': { roles: ['EMPLOYEE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
  'attendance.history': { roles: ['EMPLOYEE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
  'attendance.teamLive': { roles: ['MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
  'attendance.correction.submit': { roles: ['EMPLOYEE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
  'attendance.correction.review': {
    roles: ['MANAGER', 'ADMIN', 'SUPER_ADMIN'],
    scope: (user, resource) => {
      if (user?.role !== 'MANAGER') return true;
      return resource?.employee?.managerId === user?.id;
    },
  },

  'leave.create': { roles: ['EMPLOYEE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
  'leave.approve': {
    roles: ['MANAGER', 'ADMIN', 'SUPER_ADMIN'],
    scope: (user, resource) => {
      if (user?.role !== 'MANAGER') return true;
      return resource?.employee?.managerId === user?.id;
    },
  },
  'leave.reject': {
    roles: ['MANAGER', 'ADMIN', 'SUPER_ADMIN'],
    scope: (user, resource) => {
      if (user?.role !== 'MANAGER') return true;
      return resource?.employee?.managerId === user?.id;
    },
  },
  'leave.bulkApprove': { roles: ['ADMIN', 'SUPER_ADMIN'] },
  'leave.manageTypes': { roles: ['ADMIN', 'SUPER_ADMIN'] },
  'leave.delegate': { roles: ['MANAGER', 'ADMIN', 'SUPER_ADMIN'] },

  'analytics.view': { roles: ['MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
  'analytics.snapshot.create': { roles: ['ADMIN', 'SUPER_ADMIN'] },

  'reports.view': { roles: ['MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
  'reports.generate': { roles: ['MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
  'reports.download': { roles: ['MANAGER', 'ADMIN', 'SUPER_ADMIN'] },

  'audit.view': { roles: ['ADMIN', 'SUPER_ADMIN'] },

  'notification.manage': { roles: ['EMPLOYEE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'] },

  'organization.update': { roles: ['SUPER_ADMIN'] },

  'data.export': { roles: ['EMPLOYEE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
  'data.delete': { roles: ['EMPLOYEE', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'] },
};

export function authorize(action: string, resourceProvider?: (req: Request) => any) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated', requestId: req.requestId },
      });
    }

    const policy = policies[action];
    if (!policy) {
      return res.status(403).json({
        error: { code: 'UNKNOWN_ACTION', message: `No policy defined for action: ${action}`, requestId: req.requestId },
      });
    }

    const userRoleLevel = ROLE_HIERARCHY[req.user.role] ?? -1;
    const hasRole = policy.roles.some((role) => (ROLE_HIERARCHY[role] ?? -1) <= userRoleLevel);

    if (!hasRole) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Insufficient role permissions', requestId: req.requestId },
      });
    }

    if (policy.scope && resourceProvider) {
      const resource = resourceProvider(req);
      if (!policy.scope(req.user, resource)) {
        return res.status(403).json({
          error: { code: 'SCOPE_DENIED', message: 'Access denied for this resource', requestId: req.requestId },
        });
      }
    }

    next();
  };
}

export { ROLE_HIERARCHY, policies };
