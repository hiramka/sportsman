# Main Monorepo Dockerfile (Backend API Service)
# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci

# Copy backend application source
COPY backend/ ./
RUN npm run build
RUN npm prune --production

# Stage 2: Production runner stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy node_modules and built dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/package*.json ./
COPY --from=builder /app/backend/public ./public

EXPOSE 3000

USER node

CMD ["node", "dist/main.js"]
