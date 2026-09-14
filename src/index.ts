import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { requestIdMiddleware } from './shared/middleware/request-id';
import { errorHandler, notFoundHandler } from './shared/middleware/error-handler';
import { generalRateLimiter } from './shared/middleware/rate-limiter';
import logger from './shared/lib/logger';
import prisma from './shared/db/prisma';
import redis from './shared/redis';
import swaggerSpec from './docs/swagger';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import employeeRoutes from './modules/employees/employee.routes';
import departmentRoutes from './modules/employees/department.routes';
import shiftRoutes from './modules/shifts/shift.routes';
import attendanceRoutes from './modules/attendance/attendance.routes';
import leaveRoutes from './modules/leave/leave.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import reportRoutes from './modules/reports/report.routes';
import auditRoutes from './modules/audit/audit.routes';

const app = express();
const PORT = parseInt(process.env.PORT || '3001');

// ── Middleware ──
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(requestIdMiddleware);
app.use(generalRateLimiter);

// ── Swagger UI ──
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
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
  res.send(swaggerSpec);
});

// ── Health Endpoint ──
app.get('/health', async (_req, res) => {
  const checks: Record<string, string> = {};

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.postgres = 'ok';
  } catch {
    checks.postgres = 'error';
  }

  try {
    await redis.ping();
    checks.redis = 'ok';
  } catch {
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
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/shifts', shiftRoutes);
app.use('/api/v1/shift-assignments', shiftRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/leave', leaveRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/audit', auditRoutes);

// ── 404 & Error Handling ──
app.use(notFoundHandler);
app.use(errorHandler);

// ── Start Server ──
async function start() {
  try {
    await prisma.$connect();
    logger.info('[DB] Connected to PostgreSQL');

    try {
      await redis.ping();
      logger.info('[Redis] Connected');
    } catch {
      logger.warn('[Redis] Not available — running without Redis (in-memory rate limiting)');
    }

    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`[Server] WAMS Backend running on port ${PORT}`);
      logger.info(`[Server] Health check: http://localhost:${PORT}/health`);
      logger.info(`[Server] Swagger docs: http://localhost:${PORT}/docs`);
    });
  } catch (err) {
    logger.error('[Server] Failed to start:', err);
    process.exit(1);
  }
}

// ── Graceful Shutdown ──
async function shutdown() {
  logger.info('[Server] Shutting down...');
  await prisma.$disconnect();
  try { await redis.quit(); } catch { /* ignore */ }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();

export default app;
