FROM node:18-alpine

# Install ffmpeg for video processing
# Note: yt-dlp должен быть установлен на хост-системе
RUN apk add --no-cache ffmpeg

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy source files
COPY . .

# Build TypeScript
RUN npm run build

# Remove devDependencies after build
RUN npm prune --production

# Create downloads directory
RUN mkdir -p /app/downloads /app/uploads

# Expose the port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/index.js"] 