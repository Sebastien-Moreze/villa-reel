/**
 * logger.ts — Logger structuré Villa R.E.E.L
 *
 * - En développement  : logs colorés et lisibles dans le terminal
 * - En production     : JSON par ligne → lisible dans les logs O2switch / cPanel
 *
 * Usage :
 *   import { logger } from "@/lib/logger";
 *   logger.info("Réservation créée", { reservationId: 42, villaId: 1 });
 *   logger.error("Paiement échoué", { route: "/api/stripe/...", error });
 */

type Level = "debug" | "info" | "warn" | "error";
type LogContext = Record<string, unknown>;

/* ── Couleurs terminal (dev uniquement) ──────────────────────────────── */
const COLORS: Record<Level, string> = {
  debug: "\x1b[36m", // cyan
  info:  "\x1b[32m", // vert
  warn:  "\x1b[33m", // jaune
  error: "\x1b[31m", // rouge
};
const RESET = "\x1b[0m";

/* ── Sérialisation propre des erreurs ────────────────────────────────── */
function serializeError(err: unknown): Record<string, unknown> {
  if (err instanceof Error) {
    return {
      name:    err.name,
      message: err.message,
      stack:   process.env.NODE_ENV === "development" ? err.stack : undefined,
    };
  }
  return { raw: String(err) };
}

/* ── Fonction principale ─────────────────────────────────────────────── */
function log(level: Level, message: string, context?: LogContext) {
  const ts = new Date().toISOString();

  // Sérialise les Error dans le contexte
  const safeContext = context
    ? Object.fromEntries(
        Object.entries(context).map(([k, v]) => [
          k,
          v instanceof Error ? serializeError(v) : v,
        ])
      )
    : undefined;

  if (process.env.NODE_ENV === "production") {
    /* ── Production : JSON structuré (1 ligne / entrée) ── */
    const entry: Record<string, unknown> = {
      ts,
      level,
      message,
      ...safeContext,
    };
    // On force console.error pour error/warn afin d'écrire sur stderr
    if (level === "error" || level === "warn") {
      process.stderr.write(JSON.stringify(entry) + "\n");
    } else {
      process.stdout.write(JSON.stringify(entry) + "\n");
    }
  } else {
    /* ── Développement : format lisible avec couleurs ── */
    const color  = COLORS[level];
    const prefix = `${color}[${level.toUpperCase().padEnd(5)}]${RESET}`;
    const ctx    = safeContext ? " " + JSON.stringify(safeContext, null, 0) : "";
    console[level === "debug" ? "log" : level](
      `${prefix} ${ts}  ${message}${ctx}`
    );
  }
}

/* ── API publique ────────────────────────────────────────────────────── */
export const logger = {
  /** Détails techniques utiles en dev, ignorés en prod si LOG_LEVEL pas "debug" */
  debug: (message: string, context?: LogContext) => {
    if (process.env.LOG_LEVEL === "debug" || process.env.NODE_ENV !== "production") {
      log("debug", message, context);
    }
  },
  /** Événements normaux (réservation créée, paiement confirmé…) */
  info:  (message: string, context?: LogContext) => log("info",  message, context),
  /** Situations anormales mais non bloquantes */
  warn:  (message: string, context?: LogContext) => log("warn",  message, context),
  /** Erreurs nécessitant une attention (toujours loguées) */
  error: (message: string, context?: LogContext) => log("error", message, context),
};
