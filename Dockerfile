# Use explicit Node.js LTS version
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy dependency files first
COPY package*.json ./

# Install all dependencies (including dev) for building
RUN npm install --production=false

# Copy the rest of the source
COPY . .

# Build TypeScript
RUN npm run build

# Copy the static files, etc that were excluded in the build process
RUN npm run copy

# Remove dev dependencies after build (optional cleanup)
RUN npm prune --omit=dev

# Expose app port
EXPOSE 3000

# Start the backend (assuming compiled JS goes to dist/index.js)
CMD ["node", "dist/index.js"]