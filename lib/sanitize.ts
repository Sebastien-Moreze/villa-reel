/**
 * lib/sanitize.ts — Utilitaires de sanitisation des entrées utilisateur
 *
 * Utilisation :
 *   import { sanitizeText, sanitizeEmail, sanitizePhone } from "@/lib/sanitize";
 *
 * Ces fonctions nettoient les données AVANT stockage en DB et AVANT
 * affichage. Pour l'échappement HTML dans les emails, voir @/lib/html.ts.
 */

/* ── Texte générique ──────────────────────────────────────────────
   - Supprime les caractères de contrôle (sauf \n, \t)
   - Normalise les espaces multiples
   - Tronque à maxLength                                            */
export function sanitizeText(
  value: unknown,
  maxLength = 500,
): string {
  const str = String(value ?? "").trim();
  return str
    /* Supprime les caractères de contrôle sauf \n et \t */
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    /* Normalise les espaces multiples */
    .replace(/  +/g, " ")
    /* Limite la longueur */
    .slice(0, maxLength);
}

/* ── Email ────────────────────────────────────────────────────────
   Normalise en lowercase, supprime les espaces.                   */
export function sanitizeEmail(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s/g, "")
    .slice(0, 255);
}

/* ── Numéro de téléphone ──────────────────────────────────────────
   Garde uniquement les chiffres, +, -, espaces et parenthèses.   */
export function sanitizePhone(value: unknown): string {
  return String(value ?? "")
    .trim()
    .replace(/[^\d+\-\s().]/g, "")
    .slice(0, 30);
}

/* ── Code promo ───────────────────────────────────────────────────
   Uppercase, alphanumérique + tirets uniquement.                 */
export function sanitizePromoCode(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9\-_]/g, "")
    .slice(0, 50);
}

/* ── Nom ──────────────────────────────────────────────────────────
   Supprime les balises HTML et les caractères spéciaux dangereux. */
export function sanitizeName(value: unknown): string {
  return String(value ?? "")
    .trim()
    /* Supprime toute balise HTML */
    .replace(/<[^>]*>/g, "")
    /* Supprime les caractères de contrôle */
    .replace(/[\x00-\x1F\x7F]/g, "")
    .slice(0, 200);
}

/* ── Entier positif depuis query param ────────────────────────────
   Retourne NaN si invalide.                                       */
export function sanitizePositiveInt(value: unknown): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0 || n > 2_147_483_647) return NaN;
  return n;
}

/* ── Date ISO YYYY-MM-DD ──────────────────────────────────────────
   Retourne null si format invalide.                               */
export function sanitizeDateString(value: unknown): string | null {
  const str = String(value ?? "").trim();
  /* Format strict YYYY-MM-DD */
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
  const d = new Date(str);
  if (isNaN(d.getTime())) return null;
  return str;
}
