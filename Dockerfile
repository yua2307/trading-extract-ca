# Stage 1: Build the application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install all dependencies (prod + dev)
COPY package*.json ./
RUN npm ci --ignore-scripts  # Full install for build stage, caches dependencies

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:18-alpine AS production

# Set environment for production
ENV NODE_ENV=production
WORKDIR /app

# Copy only the necessary files from builder

# Only compiled code
COPY --from=builder /app/dist ./dist
# Package files for prod install
COPY --from=builder /app/package*.json ./

# Install only production dependencies to keep image lean
RUN npm ci --omit=dev --ignore-scripts \
  && npm cache clean --force

EXPOSE 3000

CMD ["node", "dist/main.js"]

