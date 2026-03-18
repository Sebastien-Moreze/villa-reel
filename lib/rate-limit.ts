/**
 * Rate limiter en mémoire (in-process).
 *
 * Convient pour un déploiement mono-instance.
 * Pour un déploiement multi-instance, remplacer par une solution Redis
 * (ex : @upstash/ratelimit + Upstash Redis).
 *
 * Usage :
 *   const allowed = rateLimit(`ip:${ip}`, 10, 60_000); // 10 req/min
 *   if (!allowed) return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
 */

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

// Nettoyage périodique pour éviter les fuites mémoire (toutes les 5 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Vérifie si la clé est autorisée à faire une requête.
 * @param key      Identifiant unique (ex: "ip:1.2.3.4" ou "ip:1.2.3.4:route")
 * @param limit    Nombre maximum de requêtes autorisées dans la fenêtre
 * @param windowMs Durée de la fenêtre en millisecondes
 * @returns true si autorisé, false si rate-limité
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}

/**
 * Extrait l'IP réelle depuis les headers de la requête.
 * Respecte les proxys inverses (Nginx, Cloudflare, etc.).
 */
export function getClientIp(request: Request): string {
  // Cloudflare
  const cfIp = (request as Request & { headers: Headers }).headers.get("cf-connecting-ip");
  if (cfIp) return cfIp;

  // Proxy standard
  const forwarded = (request as Request & { headers: Headers }).headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  // Fallback
  return "unknown";
}
