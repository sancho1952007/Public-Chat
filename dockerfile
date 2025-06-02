FROM oven/bun

WORKDIR /app

COPY package.json .

RUN bun install --production

CMD ["bun", "run", "start"]

EXPOSE 3000