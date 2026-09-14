import { redis } from '../redis';
import { Request, Response, NextFunction } from 'express';

const IDEMPOTENCY_TTL = 24 * 60 * 60; // 24 hours in seconds

export async function checkIdempotency(key: string): Promise<{ exists: boolean; response?: any }> {
  const stored = await redis.get(`idempotency:${key}`);
  if (stored) {
    return { exists: true, response: JSON.parse(stored) };
  }
  return { exists: false };
}

export async function storeIdempotencyResponse(key: string, response: any): Promise<void> {
  await redis.setex(`idempotency:${key}`, IDEMPOTENCY_TTL, JSON.stringify(response));
}

export function idempotencyMiddleware(req: Request, res: Response, next: NextFunction) {
  const key = req.headers['idempotency-key'] as string | undefined;
  if (!key) return next();

  const userId = req.user?.id || 'anonymous';
  const fullKey = `${userId}:${key}:${req.method}:${req.path}`;

  checkIdempotency(fullKey).then(({ exists, response }) => {
    if (exists && response) {
      return res.status(response.status || 200).json(response.body);
    }

    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        storeIdempotencyResponse(fullKey, { status: res.statusCode, body });
      }
      return originalJson(body);
    };

    next();
  }).catch(() => {
    next();
  });
}
