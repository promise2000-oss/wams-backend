"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.escalationCheckQueue = exports.leaveAccrualQueue = exports.analyticsAggregationQueue = exports.reportsQueue = exports.autoAbsentQueue = exports.notificationQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = __importDefault(require("../redis"));
const connection = redis_1.default
    ? { host: redis_1.default.options.host || 'localhost', port: redis_1.default.options.port || 6379 }
    : null;
function createQueue(name) {
    if (!connection)
        return null;
    return new bullmq_1.Queue(name, {
        connection,
        defaultJobOptions: {
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: 100,
            removeOnFail: 50,
        },
    });
}
exports.notificationQueue = createQueue('notifications');
exports.autoAbsentQueue = createQueue('auto-absent');
exports.reportsQueue = createQueue('reports');
exports.analyticsAggregationQueue = createQueue('analytics-aggregation');
exports.leaveAccrualQueue = createQueue('leave-accrual');
exports.escalationCheckQueue = createQueue('escalation-check');
//# sourceMappingURL=queues.js.map