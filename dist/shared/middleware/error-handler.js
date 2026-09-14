"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
const logger_1 = __importDefault(require("../lib/logger"));
function errorHandler(err, req, res, _next) {
    logger_1.default.error('[Error]', {
        message: err.message,
        stack: err.stack,
        requestId: req.requestId,
        userId: req.user?.id,
        orgId: req.user?.organizationId,
        path: req.path,
        method: req.method,
    });
    if (err.message.includes('Unique constraint')) {
        return res.status(409).json({
            error: {
                code: 'CONFLICT',
                message: 'A record with this data already exists',
                requestId: req.requestId,
            },
        });
    }
    if (err.message.includes('Foreign key constraint')) {
        return res.status(400).json({
            error: {
                code: 'INVALID_REFERENCE',
                message: 'Referenced record does not exist',
                requestId: req.requestId,
            },
        });
    }
    return res.status(500).json({
        error: {
            code: 'INTERNAL_ERROR',
            message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
            requestId: req.requestId,
        },
    });
}
function notFoundHandler(req, res) {
    res.status(404).json({
        error: {
            code: 'NOT_FOUND',
            message: `Route not found: ${req.method} ${req.path}`,
            requestId: req.requestId,
        },
    });
}
//# sourceMappingURL=error-handler.js.map