# ---- Build Stage ----
FROM node:20-slim AS builder

# Set working directory
WORKDIR /usr/src/app

# Install necessary build tools if needed (e.g., python, make, g++ for some native modules)
# RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy package files and install all dependencies (including dev)
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build TypeScript project
RUN npm run build

# Prune dev dependencies for cleaner production install later
RUN npm prune --production

# ---- Runtime Stage ----
FROM node:20-alpine AS runtime

# Set working directory
WORKDIR /usr/src/app

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy pruned node_modules and built code from the builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

# Copy package.json (optional, but useful for metadata)
COPY --from=builder /usr/src/app/package.json ./

# Set ownership to the non-root user
RUN chown -R appuser:appgroup /usr/src/app

# Switch to the non-root user
USER appuser

# Expose the port the app runs on (from config or default)
# Note: This needs to match the port used by the HTTP transport
EXPOSE 3001

# Define environment variables (defaults, can be overridden at runtime)
ENV NODE_ENV=production
ENV MCP_TRANSPORT=stdio
# ENV MCP_PORT=3001 # Default is set in config.ts
# ENV LOG_LEVEL=info # Default is set in logger.ts / config.ts

# Command to run the application
# Ensure dist/index.js is the correct entry point
CMD ["node", "dist/index.js"] 