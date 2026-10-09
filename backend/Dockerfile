# Multi-stage Dockerfile for NestJS Backend API
# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies including devDependencies for build
RUN npm ci

# Copy source files
COPY . .

# Build NestJS application
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# Stage 2: Production runner stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy node_modules and built dist from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public

# Expose backend port
EXPOSE 3000

# Run container as non-root user
USER node

# Start production server
CMD ["node", "dist/main.js"]
