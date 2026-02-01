# Base image
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
RUN apk add --no-cache curl
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose the ports for all services
# Gateway: 3000, Auth: 3001, Transaction: 3002
EXPOSE 3000 3001 3002

# The command to run the app
# We use ts-node to run directly from TypeScript in development
CMD ["npm", "run", "dev"]
