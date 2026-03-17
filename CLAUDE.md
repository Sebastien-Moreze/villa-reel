# Villa R.E.E.L — CLAUDE.md
> Fichier de contexte pour Claude Code / Cowork.
> Voir aussi `.cursorrules` pour les conventions détaillées.

## Résumé projet

Site de réservation de villa de luxe — **Next.js 16 + TypeScript + Prisma + PostgreSQL**.
Localisation : Reigner-Esery, Haute-Savoie (74930), France. Bilingue FR/EN.

## Stack rapide

- Next.js 16 App Router — TypeScript strict — Tailwind CSS 4
- Prisma 6 + PostgreSQL — next-intl 4 (FR/EN) — NextAuth 4 (admin)
- Stripe 20 (acompte 30% + solde J-30) — Resend + react-email
- Zod + react-hook-form — Docker + GitHub Actions CI/CD

## Dossiers clés

| Dossier | Contenu |
|---|---|
| `app/[locale]/` | Pages publiques (accueil, villa, réservation, collaborateurs, contact…) |
| `app/admin/` | Backoffice protégé (dashboard, réservations, calendrier) |
| `app/api/` | API Routes (availability, stripe, reservations, promo, auth) |
| `components/` | Composants React organisés par domaine |
| `emails/` | Templates react-email (confirmation, rappels, avis) |
| `lib/` | prisma.ts, auth.ts, emails.ts, gallery.ts, i18n.ts |
| `messages/` | fr.json + en.json (traductions next-intl) |
| `prisma/` | schema.prisma (source de vérité BDD) + seed.ts |

## Couleurs Tailwind

```
primary    #1A6B3A  (vert forêt)
secondary  #009B8D  (turquoise)
cta        #E05C3A  (corail — CTA)
background #F4F7F4  (crème)
```

## Règles métier essentielles

- Acompte = 30% TTC à la réservation (Stripe)
- Solde = 70% restant dû à J-30 (rappel email J-35)
- TVA 10% sur hébergement (France)
- Tunnel : Dates → Récap → Voyageur → Paiement → Confirmation
- Admin protégé par NextAuth JWT — routes `/admin/*`
- Une seule villa (id=1) — site mono-villa

## Conventions

- `'use client'` si hooks ou événements — sinon Server Component
- Prisma uniquement dans API routes ou Server Actions (jamais dans client)
- Textes dans `messages/fr.json` + `messages/en.json` (pas de hardcode)
- `cn()` (clsx + tailwind-merge) pour classes conditionnelles

## Documentation

Les fichiers de documentation du projet sont dans le dossier parent :
- `CDC_VillaREEL_SiteWeb.pdf` — Cahier des charges complet
- `VillaREEL_Documentation_Technique.pdf` — User Stories + Wireframes + Schéma BDD
- `VillaREEL_MCD_MLD.pdf` — Modèle Conceptuel et Logique des Données (Merise)
- `maquette_villa_reel.html` — Maquette HTML interactive
