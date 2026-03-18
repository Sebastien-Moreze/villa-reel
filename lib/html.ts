/**
 * Utilitaires HTML — sécurité
 *
 * Toujours échapper les données utilisateur avant injection dans du HTML
 * pour prévenir les attaques XSS, même dans les emails.
 */

/**
 * Échappe les caractères spéciaux HTML.
 * À utiliser sur TOUTE valeur venant de l'utilisateur avant injection dans du HTML.
 */
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Échappe le HTML et convertit les sauts de ligne en <br />.
 * Utile pour les champs "message" dans les emails.
 */
export function escapeHtmlMultiline(value: unknown): string {
  return escapeHtml(value).replace(/\n/g, "<br />");
}
