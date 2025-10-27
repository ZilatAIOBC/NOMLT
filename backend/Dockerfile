# Use Node.js LTS version
FROM node:22-alpine

# Install PM2 globally
RUN npm install -g pm2

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Expose port 3000
EXPOSE 5000

# Use PM2 to run the application
CMD ["pm2-runtime", "start", "ecosystem.config.js"]

