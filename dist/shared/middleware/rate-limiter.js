"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalRateLimiter = exports.authRateLimiter = void 0;
exports.createRateLimiter = createRateLimiter;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const rate_limit_redis_1 = __importDefault(require("rate-limit-redis"));
const redis_1 = __importDefault(require("../redis"));
let redisAvailable = false;
redis_1.default.on('connect', () => { redisAvailable = true; });
redis_1.default.on('error', () => { redisAvailable = false; });
redis_1.default.on('close', () => { redisAvailable = false; });
function createRateLimiter(options = {}) {
    const { windowMs = 15 * 60 * 1000, max = 100, keyPrefix = 'rl:', message } = options;
    return (0, express_rate_limit_1.default)({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        store: redisAvailable
            ? new rate_limit_redis_1.default({
                sendCommand: (command, ...args) => redis_1.default.call(command, ...args),
                prefix: keyPrefix,
            })
            : undefined,
        keyGenerator: (req) => {
            return `${keyPrefix}${req.ip}:${req.user?.id || 'anonymous'}`;
        },
        handler: (_req, res) => {
            res.status(429).json({
                error: {
                    code: 'RATE_LIMITED',
                    message: message || 'Too many requests. Please try again later.',
                    requestId: _req.requestId,
                },
            });
        },
    });
}
exports.authRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    keyPrefix: 'rl:auth:',
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
});
exports.generalRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
    keyPrefix: 'rl:api:',
});
//# sourceMappingURL=rate-limiter.js.map