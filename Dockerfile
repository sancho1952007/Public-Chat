# Use official Node.js image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy dependency files first
COPY package*.json ./

# Install dependencies (prod only if you don’t need dev deps)
RUN npm install --omit=dev

# Copy the rest of the source
COPY . .

# Expose app port
EXPOSE 3000

# Start the backend
CMD ["node", "index.ts"]
