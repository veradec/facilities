# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

FROM base AS deps
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
COPY . .
RUN npm run prisma:generate
RUN npx prisma migrate deploy
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV DATABASE_URL=file:./data/dev.db
ENV MEDIA_STORAGE_DIR=/app/data/uploads
ENV NEXTAUTH_URL=http://localhost:3000

COPY --from=build /app/.next .next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma

RUN mkdir -p data/uploads && chown -R node:node data
USER node

EXPOSE 3000

CMD sh -c "npx prisma migrate deploy && npx tsx prisma/seed.ts && npm start"
