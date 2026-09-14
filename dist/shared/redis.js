"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
exports.createRedisClient = createRedisClient;
const ioredis_1 = __importDefault(require("ioredis"));
const globalForRedis = globalThis;
function createRedisClient() {
    if (globalForRedis.redis)
        return globalForRedis.redis;
    const client = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379', {
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
exports.redis = createRedisClient();
exports.default = exports.redis;
//# sourceMappingURL=redis.js.map