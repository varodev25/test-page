FROM oven/bun:1
WORKDIR /app

COPY .env .env
COPY package.json .
COPY index.html .
COPY server.js .

ARG VERSION
ENV VERSION=${VERSION}

ARG PORT
ENV PORT=${PORT}

ARG BG_COLOR
ENV BG_COLOR=${BG_COLOR}

RUN bun install --production
EXPOSE 3000

CMD ["bun", "run", "start"]
