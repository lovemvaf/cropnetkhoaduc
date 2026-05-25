FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy root configs and package files
COPY package*.json ./

# Copy internal packages
COPY packages/config ./packages/config
COPY packages/types ./packages/types
COPY packages/utils ./packages/utils
COPY packages/ui ./packages/ui

# Copy backend app
COPY apps/server ./apps/server

# Install all workspace dependencies
RUN npm ci

# Run prisma generation for the server app
WORKDIR /usr/src/app/apps/server
RUN npx prisma generate

# Build the backend app and packages
WORKDIR /usr/src/app
RUN npm run build:server

# Production stage
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package descriptors
COPY package*.json ./
COPY packages/config/package*.json ./packages/config/
COPY packages/types/package*.json ./packages/types/
COPY packages/utils/package*.json ./packages/utils/
COPY packages/ui/package*.json ./packages/ui/
COPY apps/server/package*.json ./apps/server/

# Install only production dependencies
RUN npm ci --omit=dev

# Copy compiled assets from builder
COPY --from=builder /usr/src/app/apps/server/dist ./apps/server/dist
COPY --from=builder /usr/src/app/apps/server/prisma ./apps/server/prisma
COPY --from=builder /usr/src/app/packages/utils/dist ./packages/utils/dist
COPY --from=builder /usr/src/app/packages/types/dist ./packages/types/dist

# Expose backend port
EXPOSE 5000

WORKDIR /usr/src/app/apps/server

# Start server
CMD ["node", "dist/server.js"]
