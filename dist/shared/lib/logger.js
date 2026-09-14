"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const { combine, timestamp, json, printf, colorize } = winston_1.default.format;
const consoleFormat = printf(({ level, message, requestId, userId, orgId, action, ...meta }) => {
    const parts = [`[${level}]`];
    if (requestId)
        parts.push(`[${requestId}]`);
    if (orgId)
        parts.push(`[org:${orgId}]`);
    if (userId)
        parts.push(`[user:${userId}]`);
    if (action)
        parts.push(`[action:${action}]`);
    parts.push(String(message));
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return parts.join(' ') + metaStr;
});
const fileFormat = combine(timestamp(), json());
const consoleFormatCombined = combine(colorize(), timestamp({ format: 'HH:mm:ss' }), consoleFormat);
exports.logger = winston_1.default.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    defaultMeta: { service: 'wams-backend' },
    transports: [
        new winston_1.default.transports.Console({
            format: consoleFormatCombined,
        }),
        new winston_1.default.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: fileFormat,
        }),
        new winston_1.default.transports.File({
            filename: 'logs/combined.log',
            format: fileFormat,
        }),
    ],
});
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map