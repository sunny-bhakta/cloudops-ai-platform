FROM node:22.22.3-bookworm-slim AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci


FROM node:22.22.3-bookworm-slim AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .

RUN npm run build


FROM node:22.22.3-bookworm-slim AS prod-deps

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev


FROM node:22.22.3-bookworm-slim AS production

WORKDIR /app

ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules ./node_modules

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
