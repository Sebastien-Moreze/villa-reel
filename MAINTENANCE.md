# Guide de maintenance — Villa R.E.E.L

> **Règle d'or** : ne jamais toucher à la base de données sans sauvegarde préalable.
> Les réservations confirmées et les paiements Stripe sont indépendants du site — ils survivent à tout redémarrage.

---

## 1. Activer / désactiver la maintenance

### Activer (site en panne ou mise à jour)

1. Connecte-toi à **cPanel O2switch**
2. Va dans **Setup Node.js App** → ton application
3. Clique sur **Edit** → section **Environment Variables**
4. Ajoute ou modifie : `MAINTENANCE_MODE` = `true`
5. Clique **Save** puis **Restart**

✅ Le site affiche automatiquement la page "Nous revenons bientôt"
✅ Les routes `/api/*` et `/admin` restent accessibles
✅ Aucune réservation n'est touchée

### Désactiver (après intervention)

1. Même chemin → `MAINTENANCE_MODE` = `false`
2. **Restart**

---

## 2. Redémarrer l'application (site lent ou planté)

> ⚡ Le redémarrage ne touche **jamais** la base de données.

**Via cPanel :**
1. cPanel → **Setup Node.js App**
2. Clique le bouton **Restart** à côté de ton app
3. Attendre ~30 secondes puis tester le site

**Si ça ne répond toujours pas :**
1. Cliquer **Stop** puis **Start** (arrêt complet)
2. Vérifier les logs (voir section 5)

---

## 3. Déployer une mise à jour

### Procédure normale

```bash
# Sur ton Mac, dans le dossier du projet
git add .
git commit -m "description de la mise à jour"
git push origin main
```

Puis sur le serveur O2switch :
1. cPanel → **Terminal** (ou SSH)
2. Aller dans le dossier du projet :
   ```bash
   cd ~/villa-reel   # adapter selon ton chemin
   ```
3. Récupérer les changements :
   ```bash
   git pull origin main
   npm install          # seulement si package.json a changé
   npm run build
   ```
4. Redémarrer l'app dans **Setup Node.js App**

### Si le build échoue

```bash
# Voir l'erreur exacte
npm run build 2>&1 | tail -50

# Revenir à la version précédente
git log --oneline -10          # trouver le commit stable
git checkout <hash-du-commit>
npm run build
# Redémarrer
```

---

## 4. Sauvegarder la base de données

> ⚠️ **Toujours faire une sauvegarde avant** : mise à jour Prisma, nettoyage, modification manuelle.

### Backup rapide (via cPanel)

1. cPanel → **phpMyAdmin** (si MySQL) ou **Bases de données PostgreSQL**
2. Sélectionner `villa_reel`
3. **Exporter** → format SQL → Télécharger

### Backup via terminal

```bash
# PostgreSQL
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M).sql

# Restaurer depuis un backup
psql $DATABASE_URL < backup_20260318_1430.sql
```

### Fréquence recommandée

| Situation | Action |
|-----------|--------|
| Avant toute mise à jour | Backup obligatoire |
| Chaque semaine | Backup automatique cPanel (activer dans Backups) |
| Après une nouvelle réservation importante | Backup manuel conseillé |

---

## 5. Lire les logs d'erreur

### Via cPanel

1. cPanel → **Errors** ou **Raw Access** → fichiers de logs
2. Ou **Setup Node.js App** → voir la sortie de l'application

### Filtrer les erreurs importantes

```bash
# Toutes les erreurs
grep '"level":"error"' ~/logs/villa-reel.log

# Erreurs Stripe (paiements)
grep '"level":"error"' ~/logs/villa-reel.log | grep stripe

# Erreurs du jour
grep '"level":"error"' ~/logs/villa-reel.log | grep "$(date +%Y-%m-%d)"

# Dernières 50 lignes de log
tail -50 ~/logs/villa-reel.log

# Suivre les logs en temps réel
tail -f ~/logs/villa-reel.log
```

### Codes d'erreur courants

| Code | Signification | Action |
|------|--------------|--------|
| `ECONNREFUSED` | Base de données inaccessible | Vérifier DATABASE_URL dans .env |
| `STRIPE_SIGNATURE_FAILED` | Webhook Stripe invalide | Vérifier STRIPE_WEBHOOK_SECRET |
| `RATE_LIMITED` | Trop de requêtes (normal) | Aucune action requise |
| `NOT_FOUND` | Ressource introuvable | Vérifier les données en base |
| `SERVER_ERROR` | Erreur serveur générique | Consulter les logs complets |

---

## 6. Checklist avant/après intervention

### Avant toute intervention

- [ ] Activer le mode maintenance (`MAINTENANCE_MODE=true`)
- [ ] Faire un backup de la base de données
- [ ] Noter l'heure de début

### Après intervention

- [ ] Tester le site en navigation privée
- [ ] Vérifier `/api/health` → doit retourner `{"status":"ok"}`
- [ ] Tester le formulaire de réservation (étape 1 suffit)
- [ ] Désactiver le mode maintenance (`MAINTENANCE_MODE=false`)
- [ ] Redémarrer l'application

### Test de santé rapide

```
https://villareel.com/api/health
```

Réponse attendue :
```json
{ "status": "ok", "db": "connected", "timestamp": "..." }
```

Si `"db": "error"` → problème de connexion à la base de données.

---

## 7. Urgence : réservation bloquée ou paiement échoué

### Réservation créée mais paiement non confirmé

1. Aller dans l'**admin** : `villareel.com/admin`
2. Trouver la réservation par email ou date
3. Vérifier son statut (`PENDING` / `CONFIRMED` / `FAILED`)
4. Si nécessaire, contacter le client et lui demander de réessayer
5. En cas de doute, vérifier dans le **Dashboard Stripe** si le paiement est passé

### Stripe : webhook non reçu

Si une réservation est payée sur Stripe mais reste `PENDING` côté site :
1. Dashboard Stripe → **Webhooks** → vérifier les événements échoués
2. Cliquer **Resend** sur l'événement `payment_intent.succeeded` concerné

### Base de données corrompue ou inaccessible

1. **Ne pas redémarrer en boucle** — ça n'aide pas
2. Vérifier `DATABASE_URL` dans `.env` (faute de frappe, mot de passe expiré ?)
3. Vérifier que le service PostgreSQL est démarré dans cPanel
4. Restaurer depuis le dernier backup si nécessaire

---

## 8. Variables d'environnement importantes

Toutes dans le fichier `.env` sur le serveur (jamais commité sur Git) :

| Variable | Rôle | Où la trouver |
|----------|------|---------------|
| `DATABASE_URL` | Connexion PostgreSQL | cPanel → Bases de données |
| `STRIPE_SK` | Paiements Stripe | Dashboard Stripe → Développeurs |
| `STRIPE_WEBHOOK_SECRET` | Vérification webhooks | Dashboard Stripe → Webhooks |
| `NEXTAUTH_SECRET` | Sessions admin | `openssl rand -base64 32` |
| `RESEND_API_KEY` | Envoi d'emails | resend.com → API Keys |
| `CRON_SECRET` | Tâches planifiées | Généré par toi |
| `MAINTENANCE_MODE` | Mode maintenance | Mettre `true` ou `false` |

---

## 9. Contacts utiles

| Service | Support | Lien |
|---------|---------|------|
| O2switch (hébergeur) | 04 44 44 60 40 | support.o2switch.fr |
| Stripe (paiements) | support.stripe.com | dashboard.stripe.com |
| Resend (emails) | resend.com/support | resend.com |
| Développeur du site | saanesu | saanesu.com |

---

*Dernière mise à jour : mars 2026*
