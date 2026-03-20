/**
 * Vérification hCaptcha côté serveur.
 * Réutilisable dans toutes les routes API nécessitant une protection anti-spam.
 *
 * - Si HCAPTCHA_SECRET n'est pas configuré (dev local), la vérification est ignorée.
 * - Si le token est absent en production, la vérification échoue.
 */
export async function verifyHCaptcha(
  token: string | undefined,
): Promise<boolean> {
  const secret = process.env.HCAPTCHA_SECRET;

  // En développement ou si secret absent → on laisse passer
  if (!secret) {
    if (process.env.NODE_ENV !== "development") {
      console.warn("HCAPTCHA_SECRET non configuré — vérification ignorée");
    }
    return true;
  }

  // Token absent en production → refus
  if (!token) return false;

  try {
    const res = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = (await res.json()) as { success?: boolean };
    return !!data.success;
  } catch {
    return false;
  }
}
