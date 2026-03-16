This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## CI/CD & déploiement (GitHub Actions + Docker)

Les workflows GitHub Actions se trouvent dans `.github/workflows/` :

- `ci.yml` : lint, typecheck, tests (optionnels), build et build Docker (sans push).
- `pr-check.yml` : vérifications légères sur les Pull Requests (lint + typecheck + build).
- `deploy.yml` : build & push de l’image Docker vers GitHub Container Registry, puis déploiement via SSH sur le serveur.

### Secrets requis

À configurer dans **GitHub > Settings > Secrets and variables > Actions** :

- **GHCR_TOKEN** : token GitHub avec la permission `write:packages` pour pousser sur GHCR.
- **SSH_HOST** : hostname ou IP du serveur de production (O2switch).
- **SSH_USER** : utilisateur SSH utilisé pour se connecter au serveur.
- **SSH_PRIVATE_KEY** : clé privée SSH (format OpenSSH) permettant la connexion au serveur.
- **SSH_PORT** : port SSH (ex: `22`).
- **DATABASE_URL** : URL de connexion à la base de données (PostgreSQL).
- **STRIPE_SK** : clé secrète Stripe.
- **STRIPE_WEBHOOK_SECRET** : secret du webhook Stripe.
- **RESEND_API_KEY** : clé API Resend pour l’envoi d’e-mails.
- **NEXTAUTH_SECRET** : secret utilisé par NextAuth pour signer/chiffrer les tokens.

Optionnellement, vous pouvez définir une variable d’environnement (non secrète) :

- **HEALTHCHECK_URL** (variable GitHub Actions) : URL appelée après le déploiement pour vérifier la santé de l’application (par défaut `http://localhost:3000/`).

