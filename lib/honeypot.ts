/**
 * Vérification anti-spam par honeypot.
 * Le champ honeypot est invisible pour les humains mais rempli par les bots.
 * Si le champ contient une valeur, c'est un bot → refus.
 */
export function verifyHoneypot(
  honeypotValue: string | undefined | null,
): boolean {
  // Si le champ honeypot est rempli, c'est un bot
  if (honeypotValue && honeypotValue.trim().length > 0) {
    return false;
  }
  return true;
}
