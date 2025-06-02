FROM oven/bun

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN bun install

COPY public public
COPY schemas schemas
COPY views views

ENV NODE_ENV production
CMD ["bun", "index.ts"]

EXPOSE 3000