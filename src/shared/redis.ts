import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as { redis: Redis };

export function createRedisClient(): Redis {
  if (globalForRedis.redis) return globalForRedis.redis;

  const client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times: number) {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  });

  client.on('error', () => {});

  client.on('connect', () => {
    console.log('[Redis] Connected');
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForRedis.redis = client;
  }

  return client;
}

export const redis = createRedisClient();
export default redis;
