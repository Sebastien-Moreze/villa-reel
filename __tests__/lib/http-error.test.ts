import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  TooManyRequestsError,
  ServerError,
  ServiceUnavailableError,
  apiError,
} from "@/lib/http-error";

/* ── Classes d'erreurs ───────────────────────────────────────────────── */

describe("HttpError classes", () => {
  it("BadRequestError — status 400, message par défaut", () => {
    const err = new BadRequestError();
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("BadRequestError");
    expect(err.status).toBe(400);
    expect(err.message).toBe("Requête invalide");
  });

  it("BadRequestError — message personnalisé", () => {
    const err = new BadRequestError("villaId manquant");
    expect(err.message).toBe("villaId manquant");
    expect(err.status).toBe(400);
  });

  it("UnauthorizedError — status 401", () => {
    const err = new UnauthorizedError();
    expect(err.name).toBe("UnauthorizedError");
    expect(err.status).toBe(401);
    expect(err.message).toBe("Authentification requise");
  });

  it("ForbiddenError — status 403", () => {
    const err = new ForbiddenError();
    expect(err.name).toBe("ForbiddenError");
    expect(err.status).toBe(403);
    expect(err.message).toBe("Accès refusé");
  });

  it("TooManyRequestsError — status 429", () => {
    const err = new TooManyRequestsError();
    expect(err.name).toBe("TooManyRequestsError");
    expect(err.status).toBe(429);
  });

  it("ServerError — status 500", () => {
    const err = new ServerError();
    expect(err.name).toBe("ServerError");
    expect(err.status).toBe(500);
  });

  it("ServiceUnavailableError — status 503", () => {
    const err = new ServiceUnavailableError();
    expect(err.name).toBe("ServiceUnavailableError");
    expect(err.status).toBe(503);
  });

  it("toutes les erreurs héritent de Error", () => {
    const errors = [
      new BadRequestError(),
      new UnauthorizedError(),
      new ForbiddenError(),
      new TooManyRequestsError(),
      new ServerError(),
      new ServiceUnavailableError(),
    ];
    errors.forEach((e) => {
      expect(e).toBeInstanceOf(Error);
      expect(typeof e.stack).toBe("string");
    });
  });
});

/* ── Helpers API (NextResponse) ──────────────────────────────────────── */

describe("apiError helpers", () => {
  it("badRequest → 400 avec message et code par défaut", async () => {
    const res = apiError.badRequest();
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Requête invalide");
    expect(body.code).toBe("BAD_REQUEST");
  });

  it("badRequest → message et code personnalisés", async () => {
    const res = apiError.badRequest("ID manquant", "MISSING_ID");
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("ID manquant");
    expect(body.code).toBe("MISSING_ID");
  });

  it("unauthorized → 401", async () => {
    const res = apiError.unauthorized();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.code).toBe("UNAUTHORIZED");
  });

  it("forbidden → 403", async () => {
    const res = apiError.forbidden();
    expect(res.status).toBe(403);
  });

  it("notFound → 404", async () => {
    const res = apiError.notFound();
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.code).toBe("NOT_FOUND");
  });

  it("conflict → 409", async () => {
    const res = apiError.conflict();
    expect(res.status).toBe(409);
  });

  it("tooManyRequests → 429", async () => {
    const res = apiError.tooManyRequests();
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.code).toBe("RATE_LIMITED");
  });

  it("serverError → 500", async () => {
    const res = apiError.serverError();
    expect(res.status).toBe(500);
  });

  it("unavailable → 503", async () => {
    const res = apiError.unavailable();
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.code).toBe("UNAVAILABLE");
  });
});
