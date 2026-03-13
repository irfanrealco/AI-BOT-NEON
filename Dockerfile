# Arqos AI Bot — Cloud Run Dockerfile
# Multi-stage build: Node.js + Python for AI bridge scripts

FROM node:20-slim AS builder

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --production=false
COPY . .
RUN npm run build

# ── Production Image ──────────────────────────────────
FROM node:20-slim

# Install Python for TTS/Image/Transcription bridge scripts
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Install Google Cloud AI Python SDK
RUN python3 -m pip install --break-system-packages \
    google-cloud-aiplatform \
    google-generativeai

WORKDIR /app

# Copy built assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy Python bridge scripts
COPY server/*.py ./server/

# Cloud Run sets PORT env var (default 8080)
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "dist/index.cjs"]
