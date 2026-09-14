"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIdempotency = checkIdempotency;
exports.storeIdempotencyResponse = storeIdempotencyResponse;
exports.idempotencyMiddleware = idempotencyMiddleware;
const redis_1 = require("../redis");
const IDEMPOTENCY_TTL = 24 * 60 * 60; // 24 hours in seconds
async function checkIdempotency(key) {
    const stored = await redis_1.redis.get(`idempotency:${key}`);
    if (stored) {
        return { exists: true, response: JSON.parse(stored) };
    }
    return { exists: false };
}
async function storeIdempotencyResponse(key, response) {
    await redis_1.redis.setex(`idempotency:${key}`, IDEMPOTENCY_TTL, JSON.stringify(response));
}
function idempotencyMiddleware(req, res, next) {
    const key = req.headers['idempotency-key'];
    if (!key)
        return next();
    const userId = req.user?.id || 'anonymous';
    const fullKey = `${userId}:${key}:${req.method}:${req.path}`;
    checkIdempotency(fullKey).then(({ exists, response }) => {
        if (exists && response) {
            return res.status(response.status || 200).json(response.body);
        }
        const originalJson = res.json.bind(res);
        res.json = (body) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                storeIdempotencyResponse(fullKey, { status: res.statusCode, body });
            }
            return originalJson(body);
        };
        next();
    }).catch(() => {
        next();
    });
}
//# sourceMappingURL=idempotency.js.map