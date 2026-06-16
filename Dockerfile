FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application
COPY . .

# Build
RUN npm run build

# Expose port
EXPOSE 3000

# Run dev server
CMD ["npm", "start"]
