import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as { redis: Redis };

export function createRedisClient(): Redis {
  if (globalForRedis.redis) return globalForRedis.redis;

  const client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  client.on('error', (err) => {
    console.error('[Redis] Connection error:', err.message);
  });

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
