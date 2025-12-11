# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

# Copy package.json files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
COPY tests/package*.json ./tests/

# Install dependencies for all packages
RUN npm ci --only=production

# Install development dependencies for build
RUN npm ci

# Build the client application
WORKDIR /app/client
RUN npm run build

# Install server dependencies
WORKDIR /app/server
RUN npm ci --only=production

# Go back to root
WORKDIR /app

# Copy source code
COPY server/src ./server/src
COPY client/dist ./client/dist

# Copy tests (optional for CI/CD)
COPY tests ./tests

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start the server
CMD ["node", "server/src/server.js"]