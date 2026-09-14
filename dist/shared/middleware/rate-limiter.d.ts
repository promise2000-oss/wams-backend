export declare function createRateLimiter(options?: {
    windowMs?: number;
    max?: number;
    keyPrefix?: string;
    message?: string;
}): import("express-rate-limit").RateLimitRequestHandler;
export declare const authRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const generalRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
//# sourceMappingURL=rate-limiter.d.ts.map