FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy root package files
COPY package*.json ./

# Copy internal packages
COPY packages/config ./packages/config
COPY packages/types ./packages/types
COPY packages/utils ./packages/utils
COPY packages/ui ./packages/ui

# Copy frontend app
COPY apps/web ./apps/web

# Install all workspace dependencies
RUN npm ci

# Build the frontend app and packages
RUN npm run build:web

# Production stage
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY packages/config/package*.json ./packages/config/
COPY packages/types/package*.json ./packages/types/
COPY packages/utils/package*.json ./packages/utils/
COPY packages/ui/package*.json ./packages/ui/
COPY apps/web/package*.json ./apps/web/

# Install dependencies (only production)
RUN npm ci --omit=dev

# Copy compiled assets from builder
COPY --from=builder /usr/src/app/apps/web/.next ./apps/web/.next
COPY --from=builder /usr/src/app/apps/web/public ./apps/web/public
COPY --from=builder /usr/src/app/packages/utils/dist ./packages/utils/dist
COPY --from=builder /usr/src/app/packages/types/dist ./packages/types/dist
COPY --from=builder /usr/src/app/packages/ui/dist ./packages/ui/dist

# Expose frontend port
EXPOSE 3000

WORKDIR /usr/src/app/apps/web

# Start Next.js server
CMD ["npm", "run", "start"]
