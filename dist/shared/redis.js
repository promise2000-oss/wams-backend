"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const globalForRedis = globalThis;
const REDIS_URL = process.env.REDIS_URL;
function createRedisClient() {
    if (!REDIS_URL)
        return null;
    if (globalForRedis.redis)
        return globalForRedis.redis;
    const client = new ioredis_1.default(REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        retryStrategy(times) {
            if (times > 3)
                return null; // stop retrying
            return Math.min(times * 200, 2000);
        },
    });
    client.on('error', () => { });
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