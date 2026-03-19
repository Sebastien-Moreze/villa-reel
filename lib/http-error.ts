/**
 * http-error.ts — Erreurs HTTP typées pour Villa R.E.E.L
 *
 * Utilisation dans les Server Components / pages Next.js :
 *   throw new BadRequestError("Paramètre manquant");
 *   throw new ServerError("Impossible de charger la villa");
 *
 * La propriété `name` est transmise au client par Next.js même en production
 * (contrairement à `message`), ce qui permet à error.tsx de savoir quel type
 * d'erreur afficher.
 *
 * Dans les routes API, utiliser les helpers de réponse :
 *   return apiError.badRequest("Paramètre invalide");
 *   return apiError.serverError("Échec de la BD");
 */

/* ── Erreurs pour les pages / Server Components ───────────────────────── */

export class BadRequestError extends Error {
  readonly status = 400;
  constructor(message = "Requête invalide") {
    super(message);
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends Error {
  readonly status = 401;
  constructor(message = "Authentification requise") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  readonly status = 403;
  constructor(message = "Accès refusé") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class TooManyRequestsError extends Error {
  readonly status = 429;
  constructor(message = "Trop de tentatives") {
    super(message);
    this.name = "TooManyRequestsError";
  }
}

export class ServerError extends Error {
  readonly status = 500;
  constructor(message = "Erreur serveur interne") {
    super(message);
    this.name = "ServerError";
  }
}

export class ServiceUnavailableError extends Error {
  readonly status = 503;
  constructor(message = "Service temporairement indisponible") {
    super(message);
    this.name = "ServiceUnavailableError";
  }
}

/* ── Helpers pour les routes API (retournent NextResponse) ────────────── */

import { NextResponse } from "next/server";

type ApiErrorBody = { error: string; code?: string };

function json(body: ApiErrorBody, status: number) {
  return NextResponse.json(body, { status });
}

export const apiError = {
  badRequest:       (msg = "Requête invalide",                  code = "BAD_REQUEST")       => json({ error: msg, code }, 400),
  unauthorized:     (msg = "Authentification requise",          code = "UNAUTHORIZED")      => json({ error: msg, code }, 401),
  forbidden:        (msg = "Accès refusé",                      code = "FORBIDDEN")         => json({ error: msg, code }, 403),
  notFound:         (msg = "Ressource introuvable",             code = "NOT_FOUND")         => json({ error: msg, code }, 404),
  conflict:         (msg = "Conflit de données",                code = "CONFLICT")          => json({ error: msg, code }, 409),
  tooManyRequests:  (msg = "Trop de tentatives, réessayez plus tard", code = "RATE_LIMITED") => json({ error: msg, code }, 429),
  serverError:      (msg = "Erreur serveur interne",            code = "SERVER_ERROR")      => json({ error: msg, code }, 500),
  unavailable:      (msg = "Service temporairement indisponible", code = "UNAVAILABLE")     => json({ error: msg, code }, 503),
};
