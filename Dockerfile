### deps
FROM node:24-alpine AS deps
WORKDIR /app

# libc6-compat est recommandé pour certaines dépendances natives
RUN apk add --no-cache libc6-compat python3 make g++ openssl

COPY package.json package-lock.json ./
# On ignore les scripts ici (ex: postinstall prisma generate) car le schéma Prisma
# n'est pas encore copié dans cette étape.
RUN npm ci --ignore-scripts

### builder
FROM node:24-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ── Déclaration des ARGs passés par --build-arg ──────────────────────────────
ARG DATABASE_URL
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL
ARG STRIPE_SK
ARG NEXT_PUBLIC_STRIPE_PK
ARG STRIPE_WEBHOOK_SECRET
ARG RESEND_API_KEY
ARG CONTACT_EMAIL
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_HCAPTCHA_SITE_KEY
ARG CRON_SECRET

# ── CRITICAL : exporter les ARGs en ENV pour que next build puisse les lire ───
# Sans ces lignes, npm run build n'a accès à aucune variable d'environnement.
ENV NODE_ENV=production
ENV DATABASE_URL=$DATABASE_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV STRIPE_SK=$STRIPE_SK
ENV NEXT_PUBLIC_STRIPE_PK=$NEXT_PUBLIC_STRIPE_PK
ENV STRIPE_WEBHOOK_SECRET=$STRIPE_WEBHOOK_SECRET
ENV RESEND_API_KEY=$RESEND_API_KEY
ENV CONTACT_EMAIL=$CONTACT_EMAIL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_HCAPTCHA_SITE_KEY=$NEXT_PUBLIC_HCAPTCHA_SITE_KEY
ENV CRON_SECRET=$CRON_SECRET

# Génération du client Prisma (obligatoire avant le build Next.js)
RUN npx prisma generate

RUN npm run build

### runner
FROM node:24-alpine AS runner
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

