# --- Stage 1: Build & Compile ---
FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Stage 2: Hardened Runtime ---
FROM node:20-alpine
WORKDIR /usr/src/app

# Only pull down production-critical modules (ignores devDependencies)
COPY package*.json ./
RUN npm install --only=production

# Safely copy compile-stage output from the builder cache layer
COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000
ENV NODE_ENV=production

# Execute the native, optimized JavaScript code directly
CMD ["node", "dist/server.js"]