FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build TypeScript
RUN npm run clean && \
    npm run build || \
    (echo "Build failed, but continuing..." && exit 0)

# Expose the port your app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 