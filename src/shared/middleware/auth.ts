import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import redis from '../redis';
import logger from '../lib/logger';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev-access-secret';

interface AccessTokenPayload {
  sub: string;
  organizationId: string;
  email: string;
  name: string;
  role: string;
  departmentId?: string | null;
  managerId?: string | null;
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Missing or invalid authorization header', requestId: req.requestId },
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Missing token', requestId: req.requestId },
      });
    }

    // Check if token is revoked (logout / force-revocation)
    const isRevoked = await redis.get(`token:revoked:${token}`);
    if (isRevoked) {
      return res.status(401).json({
        error: { code: 'TOKEN_REVOKED', message: 'Token has been revoked', requestId: req.requestId },
      });
    }

    const payload = jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;

    req.user = {
      id: payload.sub,
      organizationId: payload.organizationId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      departmentId: payload.departmentId,
      managerId: payload.managerId,
    };

    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: { code: 'TOKEN_EXPIRED', message: 'Access token expired', requestId: req.requestId },
      });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: { code: 'INVALID_TOKEN', message: 'Invalid token', requestId: req.requestId },
      });
    }
    logger.error('[Auth] Unexpected error in auth middleware', { error: err.message });
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Authentication error', requestId: req.requestId },
    });
  }
}

export function generateAccessToken(user: {
  id: string;
  organizationId: string;
  email: string;
  name: string;
  role: string;
  departmentId?: string | null;
  managerId?: string | null;
}): string {
  const expiresIn = (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as any;
  return jwt.sign(
    {
      sub: user.id,
      organizationId: user.organizationId,
      email: user.email,
      name: user.name,
      role: user.role,
      departmentId: user.departmentId,
      managerId: user.managerId,
    },
    ACCESS_SECRET,
    { expiresIn }
  );
}
