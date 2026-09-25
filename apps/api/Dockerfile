FROM node:22.22.3-bookworm-slim AS deps

WORKDIR /app

COPY package*.json ./

RUN node -v && npm -v

RUN npm ci --verbose \
	|| (echo "npm ci failed in deps stage" \
			&& ls -la /root/.npm/_logs || true \
			&& cat /root/.npm/_logs/*-debug-0.log || true \
			&& exit 1)


FROM node:22.22.3-bookworm-slim AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .

RUN npm run build


FROM node:22.22.3-bookworm-slim AS prod-deps

WORKDIR /app

COPY package*.json ./

RUN node -v && npm -v

RUN npm ci --omit=dev --verbose \
	|| (echo "npm ci --omit=dev failed in prod-deps stage" \
			&& ls -la /root/.npm/_logs || true \
			&& cat /root/.npm/_logs/*-debug-0.log || true \
			&& exit 1)


FROM node:22.22.3-bookworm-slim AS production

WORKDIR /app

ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules ./node_modules

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
