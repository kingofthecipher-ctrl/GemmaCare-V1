# ── Build stage ────────────────────────────────────────────
FROM node:22.23.4-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

RUN npm install -g pnpm@10.34.5 && pnpm install --frozen-lockfile

COPY . .

RUN pnpm build && echo "Build output:" && ls -la dist/

# ── Runtime stage ──────────────────────────────────────────
FROM node:22.23.4-alpine

# Install ffmpeg — converts browser audio (WebM/Opus, MP4/AAC)
# to 16kHz mono WAV before sending to Gemma 4's audio encoder.
# Verify it works at build time so we fail fast if something is wrong.
RUN apk add --no-cache ffmpeg \
 && ffmpeg -version 2>&1 | head -1 \
 && echo "ffmpeg OK"

WORKDIR /app

RUN npm install -g pnpm@10.34.5

COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/

RUN apk add --no-cache --virtual .build-deps python3 make g++ \
 && pnpm install --frozen-lockfile --prod \
 && apk del .build-deps

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle

RUN echo "Runtime dist:" && ls -la dist/

ENV NODE_ENV=production

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=10s --start-period=45s --retries=6 \
  CMD node -e "const h=require('http');h.get('http://localhost:8080/',r=>{process.exit(r.statusCode<500?0:1)}).on('error',()=>process.exit(1))"

CMD ["node", "dist/index.cjs"]
