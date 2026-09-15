import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as { redis: Redis };

const REDIS_URL = process.env.REDIS_URL;

function createRedisClient(): Redis | null {
  if (!REDIS_URL) return null;

  if (globalForRedis.redis) return globalForRedis.redis;

  const client = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
      if (times > 3) return null; // stop retrying
      return Math.min(times * 200, 2000);
    },
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
