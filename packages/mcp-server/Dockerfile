# Dockerfile for ClearFetch MCP Server
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm install
COPY src/ ./src/
COPY bin/ ./bin/
RUN npm run build

FROM node:22-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/bin ./bin

ENV NODE_ENV=production
ENTRYPOINT ["node", "./bin/clearfetch-mcp.js"]
