FROM node:18-alpine

# Install yt-dlp and ffmpeg for video downloading
RUN apk add --no-cache python3 py3-pip ffmpeg && \
    pip3 install --no-cache-dir yt-dlp

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source files
COPY . .

# Build TypeScript
RUN npm run build

# Create downloads directory
RUN mkdir -p /app/downloads /app/uploads

# Expose the port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/index.js"] 