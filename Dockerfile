FROM oven/bun

COPY package.json .

# Install Python and build-essential tools
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

RUN bun install

WORKDIR /app

COPY index.ts .
COPY tsconfig.json .
COPY public public
COPY schemas schemas
COPY views views

ENV NODE_ENV=production
CMD ["bun", "index.ts"]

EXPOSE 3000
