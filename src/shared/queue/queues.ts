import { Queue } from 'bullmq';
import redis from '../redis';

const connection = redis
  ? { host: redis.options.host || 'localhost', port: redis.options.port || 6379 }
  : null;

function createQueue(name: string) {
  if (!connection) return null;
  return new Queue(name, {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    },
  });
}

export const notificationQueue = createQueue('notifications');
export const autoAbsentQueue = createQueue('auto-absent');
export const reportsQueue = createQueue('reports');
export const analyticsAggregationQueue = createQueue('analytics-aggregation');
export const leaveAccrualQueue = createQueue('leave-accrual');
export const escalationCheckQueue = createQueue('escalation-check');
