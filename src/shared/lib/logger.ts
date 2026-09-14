import winston from 'winston';

const { combine, timestamp, json, printf, colorize } = winston.format;

const consoleFormat = printf(({ level, message, requestId, userId, orgId, action, ...meta }) => {
  const parts = [`[${level}]`];
  if (requestId) parts.push(`[${requestId}]`);
  if (orgId) parts.push(`[org:${orgId}]`);
  if (userId) parts.push(`[user:${userId}]`);
  if (action) parts.push(`[action:${action}]`);
  parts.push(String(message));
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return parts.join(' ') + metaStr;
});

const fileFormat = combine(timestamp(), json());

const consoleFormatCombined = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  consoleFormat,
);

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  defaultMeta: { service: 'wams-backend' },
  transports: [
    new winston.transports.Console({
      format: consoleFormatCombined,
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: fileFormat,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: fileFormat,
    }),
  ],
});

export default logger;
