# Use the official Bun image
FROM oven/bun:latest

# Install system dependencies for node-gyp
RUN apt-get update && apt-get install -y python3 build-essential

# Set working directory
WORKDIR /app

# Copy package.json
COPY package.json ./

# Install dependencies
RUN bun install

# Copy the rest of the application code
COPY . .

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["bun", "run", "start"]