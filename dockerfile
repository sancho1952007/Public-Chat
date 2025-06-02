# 1. Use the official Bun image
FROM oven/bun:latest

# 2. Set working directory inside the container
WORKDIR /

# 3. Copy only package.json and bun.lock first to leverage Docker’s layer cache
COPY package.json ./

# 4. Install dependencies via Bun
RUN bun install
COPY . .
EXPOSE 3000

# 9. Default command: run your app via Bun.
CMD ["bun", "run", "start"]