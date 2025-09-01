# Using the official Bun image
FROM oven/bun:1.2.19

# Setting the working directory
WORKDIR /app

# Copy dependency files first (for better cache usage)
COPY package.json ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Run the production script
# CMD ["bun", "start"]

# Build a binary since it's recommended in production
RUN bun build \
    --compile \
    --minify-whitespace \
    --minify-syntax \
    --target bun \
    --outfile server \
    ./index.ts

# Expose app port
EXPOSE 3000

# Run the built binary
CMD ["./server"]