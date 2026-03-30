import { rateLimit, getClientIp } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("autorise les premières requêtes dans la limite", () => {
    const key = `test-${Date.now()}-allow`;
    expect(rateLimit(key, 3, 60_000)).toBe(true);
    expect(rateLimit(key, 3, 60_000)).toBe(true);
    expect(rateLimit(key, 3, 60_000)).toBe(true);
  });

  it("bloque au-delà de la limite", () => {
    const key = `test-${Date.now()}-block`;
    rateLimit(key, 2, 60_000); // 1
    rateLimit(key, 2, 60_000); // 2
    expect(rateLimit(key, 2, 60_000)).toBe(false); // 3 → bloqué
  });

  it("réinitialise après expiration de la fenêtre", () => {
    const key = `test-${Date.now()}-expire`;
    // Fenêtre de 1 ms
    rateLimit(key, 1, 1);

    // Attendre que la fenêtre expire
    const start = Date.now();
    while (Date.now() - start < 5) {
      /* busy wait */
    }

    expect(rateLimit(key, 1, 1)).toBe(true);
  });

  it("isole les clés différentes", () => {
    const keyA = `test-${Date.now()}-a`;
    const keyB = `test-${Date.now()}-b`;
    rateLimit(keyA, 1, 60_000);
    expect(rateLimit(keyA, 1, 60_000)).toBe(false); // A bloqué
    expect(rateLimit(keyB, 1, 60_000)).toBe(true); // B encore OK
  });

  it("limit=1 bloque dès la deuxième requête", () => {
    const key = `test-${Date.now()}-one`;
    expect(rateLimit(key, 1, 60_000)).toBe(true);  // 1ère OK
    expect(rateLimit(key, 1, 60_000)).toBe(false);  // 2ème bloquée
  });
});

describe("getClientIp", () => {
  function makeRequest(headers: Record<string, string>): Request {
    return {
      headers: new Headers(headers),
    } as Request;
  }

  it("retourne l'IP Cloudflare en priorité", () => {
    const req = makeRequest({
      "cf-connecting-ip": "1.2.3.4",
      "x-forwarded-for": "5.6.7.8",
    });
    expect(getClientIp(req)).toBe("1.2.3.4");
  });

  it("retourne x-forwarded-for si pas de Cloudflare", () => {
    const req = makeRequest({
      "x-forwarded-for": "10.0.0.1, 10.0.0.2",
    });
    expect(getClientIp(req)).toBe("10.0.0.1");
  });

  it("retourne 'unknown' sans headers proxy", () => {
    const req = makeRequest({});
    expect(getClientIp(req)).toBe("unknown");
  });

  it("trim l'IP x-forwarded-for", () => {
    const req = makeRequest({
      "x-forwarded-for": "  192.168.1.1  , 10.0.0.1",
    });
    expect(getClientIp(req)).toBe("192.168.1.1");
  });
});
