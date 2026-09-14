FROM node:20-alpine AS base

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# ── Build stage ──
FROM base AS builder

WORKDIR /app

# Copy dependency manifests first (layer caching)
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev for build)
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source
COPY tsconfig.json ./
COPY src ./src
COPY app ./app

# Compile TypeScript
RUN npm run build

# ── Production stage ──
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy dependency manifests
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --omit=dev

# Generate Prisma Client for production
RUN npx prisma generate

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S wams && \
    adduser -S wams -u 1001 -G wams

# Create logs directory
RUN mkdir -p /app/logs && chown -R wams:wams /app

USER wams

EXPOSE 3001

# Use dumb-init to handle PID 1 and signal forwarding
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
