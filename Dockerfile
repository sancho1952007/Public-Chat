FROM oven/bun

COPY package.json .

RUN bun install

WORKDIR /app

COPY index.ts .
COPY tsconfig.json .
COPY public public
COPY schemas schemas
COPY views views

ENV NODE_ENV production
CMD ["bun", "index.ts"]

EXPOSE 3000