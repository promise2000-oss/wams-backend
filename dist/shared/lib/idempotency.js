"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIdempotency = checkIdempotency;
exports.storeIdempotencyResponse = storeIdempotencyResponse;
exports.idempotencyMiddleware = idempotencyMiddleware;
const redis_1 = __importDefault(require("../redis"));
const IDEMPOTENCY_TTL = 24 * 60 * 60; // 24 hours in seconds
// In-memory fallback when Redis is unavailable
const memoryStore = new Map();
function cleanupMemoryStore() {
    const now = Date.now();
    for (const [key, entry] of memoryStore) {
        if (entry.expires < now)
            memoryStore.delete(key);
    }
}
setInterval(cleanupMemoryStore, 60_000);
async function checkIdempotency(key) {
    if (redis_1.default) {
        const stored = await redis_1.default.get(`idempotency:${key}`);
        if (stored)
            return { exists: true, response: JSON.parse(stored) };
    }
    else {
        const entry = memoryStore.get(key);
        if (entry && entry.expires > Date.now()) {
            return { exists: true, response: JSON.parse(entry.data) };
        }
        if (entry)
            memoryStore.delete(key);
    }
    return { exists: false };
}
async function storeIdempotencyResponse(key, response) {
    const data = JSON.stringify(response);
    if (redis_1.default) {
        await redis_1.default.setex(`idempotency:${key}`, IDEMPOTENCY_TTL, data);
    }
    else {
        memoryStore.set(key, { expires: Date.now() + IDEMPOTENCY_TTL * 1000, data });
    }
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