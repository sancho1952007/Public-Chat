# Use the official Bun image
FROM oven/bun:1.2.20

# Set the working directory
WORKDIR /app

# Copy dependency files first (for better cache usage)
COPY package.json ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Expose app port (make sure this matches your server)
EXPOSE 3000

# Run the production script
CMD ["bun", "start"]
