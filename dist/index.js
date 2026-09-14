"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const request_id_1 = require("./shared/middleware/request-id");
const error_handler_1 = require("./shared/middleware/error-handler");
const rate_limiter_1 = require("./shared/middleware/rate-limiter");
const logger_1 = __importDefault(require("./shared/lib/logger"));
const prisma_1 = __importDefault(require("./shared/db/prisma"));
const redis_1 = __importDefault(require("./shared/redis"));
const swagger_1 = __importDefault(require("./docs/swagger"));
// Route imports
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const employee_routes_1 = __importDefault(require("./modules/employees/employee.routes"));
const department_routes_1 = __importDefault(require("./modules/employees/department.routes"));
const shift_routes_1 = __importDefault(require("./modules/shifts/shift.routes"));
const attendance_routes_1 = __importDefault(require("./modules/attendance/attendance.routes"));
const leave_routes_1 = __importDefault(require("./modules/leave/leave.routes"));
const notification_routes_1 = __importDefault(require("./modules/notifications/notification.routes"));
const analytics_routes_1 = __importDefault(require("./modules/analytics/analytics.routes"));
const report_routes_1 = __importDefault(require("./modules/reports/report.routes"));
const audit_routes_1 = __importDefault(require("./modules/audit/audit.routes"));
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '3001');
// ── Middleware ──
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(request_id_1.requestIdMiddleware);
app.use(rate_limiter_1.generalRateLimiter);
// ── Swagger UI ──
app.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'WAMS API Documentation',
    swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'list',
        filter: true,
    },
}));
app.get('/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swagger_1.default);
});
// ── Health Endpoint ──
app.get('/health', async (_req, res) => {
    const checks = {};
    try {
        await prisma_1.default.$queryRaw `SELECT 1`;
        checks.postgres = 'ok';
    }
    catch {
        checks.postgres = 'error';
    }
    try {
        await redis_1.default.ping();
        checks.redis = 'ok';
    }
    catch {
        checks.redis = 'degraded';
    }
    const allOk = Object.values(checks).every((v) => v === 'ok');
    res.status(allOk ? 200 : 503).json({
        status: allOk ? 'healthy' : 'degraded',
        checks,
        timestamp: new Date().toISOString(),
    });
});
// ── API Routes ──
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/employees', employee_routes_1.default);
app.use('/api/v1/departments', department_routes_1.default);
app.use('/api/v1/shifts', shift_routes_1.default);
app.use('/api/v1/shift-assignments', shift_routes_1.default);
app.use('/api/v1/attendance', attendance_routes_1.default);
app.use('/api/v1/leave', leave_routes_1.default);
app.use('/api/v1/notifications', notification_routes_1.default);
app.use('/api/v1/analytics', analytics_routes_1.default);
app.use('/api/v1/reports', report_routes_1.default);
app.use('/api/v1/audit', audit_routes_1.default);
// ── 404 & Error Handling ──
app.use(error_handler_1.notFoundHandler);
app.use(error_handler_1.errorHandler);
// ── Start Server ──
async function start() {
    try {
        await prisma_1.default.$connect();
        logger_1.default.info('[DB] Connected to PostgreSQL');
        try {
            await redis_1.default.ping();
            logger_1.default.info('[Redis] Connected');
        }
        catch {
            logger_1.default.warn('[Redis] Not available — running without Redis (in-memory rate limiting)');
        }
        app.listen(PORT, '0.0.0.0', () => {
            logger_1.default.info(`[Server] WAMS Backend running on port ${PORT}`);
            logger_1.default.info(`[Server] Health check: http://localhost:${PORT}/health`);
            logger_1.default.info(`[Server] Swagger docs: http://localhost:${PORT}/docs`);
        });
    }
    catch (err) {
        logger_1.default.error('[Server] Failed to start:', err);
        process.exit(1);
    }
}
// ── Graceful Shutdown ──
async function shutdown() {
    logger_1.default.info('[Server] Shutting down...');
    await prisma_1.default.$disconnect();
    try {
        await redis_1.default.quit();
    }
    catch { /* ignore */ }
    process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
start();
exports.default = app;
//# sourceMappingURL=index.js.map