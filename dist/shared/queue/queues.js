"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escalationCheckQueue = exports.leaveAccrualQueue = exports.analyticsAggregationQueue = exports.reportsQueue = exports.autoAbsentQueue = exports.notificationQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../redis");
const connection = {
    host: redis_1.redis.options.host || 'localhost',
    port: redis_1.redis.options.port || 6379,
};
exports.notificationQueue = new bullmq_1.Queue('notifications', {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 50,
    },
});
exports.autoAbsentQueue = new bullmq_1.Queue('auto-absent', {
    connection,
    defaultJobOptions: {
        attempts: 2,
        backoff: { type: 'fixed', delay: 5000 },
        removeOnComplete: 50,
        removeOnFail: 50,
    },
});
exports.reportsQueue = new bullmq_1.Queue('reports', {
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 },
        removeOnComplete: 100,
        removeOnFail: 50,
    },
});
exports.analyticsAggregationQueue = new bullmq_1.Queue('analytics-aggregation', {
    connection,
    defaultJobOptions: {
        attempts: 2,
        backoff: { type: 'fixed', delay: 5000 },
        removeOnComplete: 50,
        removeOnFail: 50,
    },
});
exports.leaveAccrualQueue = new bullmq_1.Queue('leave-accrual', {
    connection,
    defaultJobOptions: {
        attempts: 2,
        backoff: { type: 'fixed', delay: 5000 },
        removeOnComplete: 50,
        removeOnFail: 50,
    },
});
exports.escalationCheckQueue = new bullmq_1.Queue('escalation-check', {
    connection,
    defaultJobOptions: {
        attempts: 2,
        backoff: { type: 'fixed', delay: 5000 },
        removeOnComplete: 50,
        removeOnFail: 50,
    },
});
//# sourceMappingURL=queues.js.map