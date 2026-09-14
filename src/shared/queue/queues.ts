import { Queue } from 'bullmq';
import { redis } from '../redis';

const connection = {
  host: redis.options.host || 'localhost',
  port: redis.options.port || 6379,
};

export const notificationQueue = new Queue('notifications', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

export const autoAbsentQueue = new Queue('auto-absent', {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'fixed', delay: 5000 },
    removeOnComplete: 50,
    removeOnFail: 50,
  },
});

export const reportsQueue = new Queue('reports', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 3000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

export const analyticsAggregationQueue = new Queue('analytics-aggregation', {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'fixed', delay: 5000 },
    removeOnComplete: 50,
    removeOnFail: 50,
  },
});

export const leaveAccrualQueue = new Queue('leave-accrual', {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'fixed', delay: 5000 },
    removeOnComplete: 50,
    removeOnFail: 50,
  },
});

export const escalationCheckQueue = new Queue('escalation-check', {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'fixed', delay: 5000 },
    removeOnComplete: 50,
    removeOnFail: 50,
  },
});
