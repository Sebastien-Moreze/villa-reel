## Villa R.E.E.L – Plateforme de location de villa premium à Reigner-Esery

Villa R.E.E.L est une plateforme de réservation en ligne pour une villa premium située à Reigner-Esery (74930), en Haute-Savoie, France.  
L’objectif est de proposer une expérience de réservation fluide, sécurisée et haut de gamme, avec une identité visuelle tropicale et chaleureuse.

### Stack technique

- **Framework frontend** : Next.js 14 (App Router) avec React Server Components
- **Langage** : TypeScript (mode strict)
- **UI** : Tailwind CSS (charte tropicale : vert #1A6B3A, turquoise #009B8D, sable #C8A050, corail #E05C3A, crème #F4F7F4)
- **Base de données** : PostgreSQL via Prisma ORM (hébergée sur Supabase)
- **Paiements** : Stripe (Payment Intents + webhooks)
- **Emails transactionnels** : Resend avec templates React Email
- **i18n** : `next-intl` (FR par défaut, EN secondaire)
- **Auth** : NextAuth (ou équivalent, avec secret et URL configurés)
- **Hébergement** : O2switch (cPanel) via Docker + PM2 + reverse proxy Apache
- **CI/CD** : GitHub Actions → build Docker → déploiement automatique

### Prérequis

- Node.js 20.x ou supérieur
- npm, pnpm ou yarn (exemples ci-dessous avec **npm**)
- Accès à une base PostgreSQL (ex : Supabase)
- Comptes Stripe, Resend, Supabase, etc.

### Installation locale

1. **Cloner le dépôt**

```bash
git clone <URL_DU_REPO_GITHUB> villa-reel
cd villa-reel
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configurer les variables d’environnement**

- Dupliquer le fichier `.env.example` en `.env.local` :

```bash
cp .env.example .env.local
```

- Renseigner toutes les variables avec vos valeurs (PostgreSQL, Stripe, Resend, NextAuth, URL du site, etc.).

4. **Lancer les migrations Prisma**

```bash
npx prisma migrate dev
```

5. **Démarrer le serveur de développement**

```bash
npm run dev
```

L’application sera disponible sur `http://localhost:3000`.

### Variables d’environnement

Les variables suivantes doivent être définies (voir `.env.example`) :

- **`DATABASE_URL`** : URL de connexion PostgreSQL (ex : Supabase)
- **`NEXT_PUBLIC_STRIPE_PK`** : clé publique Stripe (publishable key)
- **`STRIPE_SK`** : clé secrète Stripe (secret key)
- **`STRIPE_WEBHOOK_SECRET`** : secret du webhook Stripe
- **`RESEND_API_KEY`** : clé API Resend
- **`NEXTAUTH_SECRET`** : secret NextAuth (généré de manière sécurisée)
- **`NEXTAUTH_URL`** : URL publique de l’app (ex : `http://localhost:3000` en dev)
- **`NEXT_PUBLIC_SITE_URL`** : URL publique du site exposée au frontend (ex : `https://villa-reel.com`)

### Commandes utiles

- **Démarrer en développement**

```bash
npm run dev
```

- **Build de production**

```bash
npm run build
```

- **Lancer la version buildée**

```bash
npm start
```

- **Lint**

```bash
npm run lint
```

- **Migrations Prisma**

```bash
npx prisma migrate dev
```

### Conventions de code

- **TypeScript strict** : pas de `any` implicite
- **Composants** : Server Components par défaut, Client Components uniquement si nécessaire (état, hooks, interactions)
- **États UI** : toujours prévoir `loading`, `error`, `empty state`
- **Accessibilité** : respect minimum WCAG 2.1 AA
- **Responsive** : mobile-first, breakpoints 480 / 768 / 1024
- **Commits** : format conventionnel, par ex. :
  - `feat: ...` pour les fonctionnalités
  - `fix: ...` pour les corrections
  - `chore: ...` pour la maintenance
  - `docs: ...` pour la documentation

### Contribution

1. Créer une branche à partir de `main` :

```bash
git checkout -b feat/ma-fonctionnalite
```

2. Développer, ajouter des tests si nécessaire, respecter les conventions.
3. Pousser la branche et ouvrir une Pull Request en suivant le template fourni dans `.github/PULL_REQUEST_TEMPLATE.md`.

### Licence

Projet propriétaire – tous droits réservés à Villa R.E.E.L / Saanesu.
