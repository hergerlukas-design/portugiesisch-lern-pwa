# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./

# Install dependencies
RUN npm ci

# Copy source code
COPY public ./public
COPY src ./src
COPY index.html ./

# Build the app
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install wget for health check + simple HTTP server
RUN apk add --no-cache wget && npm install -g serve

# Copy built app from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080 || exit 1

# Start server (use PORT env var if set, otherwise default to 8080)
CMD ["sh", "-c", "serve -s dist -l ${PORT:-8080}"]
