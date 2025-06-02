# 1. Use official Bun image
FROM oven/bun:latest

# 2. Install system dependencies for native module builds
RUN apt-get update && apt-get install -y \
  python3 \
  build-essential \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# 3. Set working directory
WORKDIR /app

# 4. Copy only package files first (for Docker cache)
COPY package.json bun.lockb* ./

# 5. Install dependencies
RUN bun install

# 6. Copy the rest of the app
COPY . .

# 7. Expose app port
EXPOSE 3000

# 8. Start the app
CMD ["bun", "run", "start"]