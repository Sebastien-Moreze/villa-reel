### deps
FROM node:18-alpine AS deps
WORKDIR /app

# libc6-compat est recommandé pour certaines dépendances natives
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
RUN npm ci

### builder
FROM node:18-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ARG disponibles au build (ne pas mettre de secrets réels en dur)
ARG DATABASE_URL
ARG NEXTAUTH_SECRET
ARG STRIPE_SK
ARG STRIPE_WEBHOOK_SECRET
ARG RESEND_API_KEY

ENV NODE_ENV=production

RUN npm run build

### runner
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# User non-root
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

# Standalone output
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]

