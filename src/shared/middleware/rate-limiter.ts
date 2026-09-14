import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from '../redis';

let redisAvailable = false;

redis.on('connect', () => { redisAvailable = true; });
redis.on('error', () => { redisAvailable = false; });
redis.on('close', () => { redisAvailable = false; });

export function createRateLimiter(options: {
  windowMs?: number;
  max?: number;
  keyPrefix?: string;
  message?: string;
} = {}) {
  const { windowMs = 15 * 60 * 1000, max = 100, keyPrefix = 'rl:', message } = options;

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    store: redisAvailable
      ? new RedisStore({
          sendCommand: (command: string, ...args: string[]) => redis.call(command, ...args) as any,
          prefix: keyPrefix,
        })
      : undefined,
    keyGenerator: (req) => {
      const ip = ipKeyGenerator(req.ip || '');
      return `${keyPrefix}${ip}:${req.user?.id || 'anonymous'}`;
    },
    handler: (_req, res) => {
      res.status(429).json({
        error: {
          code: 'RATE_LIMITED',
          message: message || 'Too many requests. Please try again later.',
          requestId: (_req as any).requestId,
        },
      });
    },
  });
}

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyPrefix: 'rl:auth:',
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
});

export const generalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyPrefix: 'rl:api:',
});
