"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalRateLimiter = exports.authRateLimiter = void 0;
exports.createRateLimiter = createRateLimiter;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_rate_limit_2 = require("express-rate-limit");
function createRateLimiter(options = {}) {
    const { windowMs = 15 * 60 * 1000, max = 100, keyPrefix = 'rl:', message } = options;
    return (0, express_rate_limit_1.default)({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => {
            return `${keyPrefix}${express_rate_limit_2.ipKeyGenerator(req)}:${req.user?.id || 'anonymous'}`;
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