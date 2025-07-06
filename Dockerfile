# Use Node.js LTS version
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy package.json files
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN cd client && npm ci
RUN cd server && npm ci

# Copy source code
COPY client ./client
COPY server ./server

# Build client
RUN cd client && npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy server files
COPY --from=build /app/server ./server
COPY --from=build /app/client/dist ./client/dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "server/server.js"]