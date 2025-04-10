# Build Stage
FROM node:20-slim AS builder

WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package.json package-lock.json ./

EXPOSE 5014

# Use npm ci for clean, repeatable installs
RUN npm ci

# Copy application source code and build it
COPY . .
RUN npm run build

# Runtime Stage
FROM node:20-slim

WORKDIR /usr/src/app

# Copy necessary files for runtime
COPY package.json package-lock.json ./
COPY --from=builder /usr/src/app/dist ./dist

# Install only production dependencies
RUN npm ci --production

# Set ENTRYPOINT to enforce the base command
ENTRYPOINT ["node", "dist/src/main.js"]