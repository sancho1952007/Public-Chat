# 1. Use the official Bun image
FROM oven/bun:latest

# 2. Install Python and build tools required for native modules
RUN apt-get update && \
    apt-get install -y python3 build-essential && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 3. Set working directory inside the container
WORKDIR /app

# 4. Copy package.json to leverage Docker’s layer cache
COPY package.json ./

# 5. Install dependencies via Bun
RUN bun install

# 6. Copy the rest of your application code
COPY . .

# 7. Expose the application's port
EXPOSE 3000

# 8. Default command: run your app via Bun
CMD ["bun", "run", "start"]