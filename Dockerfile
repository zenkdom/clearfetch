# Production Dockerfile for ClearFetch Model Context Protocol (MCP) Server
FROM node:22-alpine AS builder

WORKDIR /app
COPY packages/mcp-server/package*.json packages/mcp-server/tsconfig.json ./
RUN npm install
COPY packages/mcp-server/src/ ./src/
COPY packages/mcp-server/bin/ ./bin/
RUN npm run build

FROM node:22-alpine

WORKDIR /app
COPY packages/mcp-server/package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/bin ./bin

ENV NODE_ENV=production
ENTRYPOINT ["node", "./bin/clearfetch-mcp.js"]
