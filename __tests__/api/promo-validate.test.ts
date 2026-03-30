/**
 * Tests pour POST /api/promo/validate
 */
import { POST } from "@/app/api/promo/validate/route";

/* ── Mocks ──────────────────────────────────────────────────────────── */

jest.mock("@/lib/prisma", () => ({
  prisma: {
    promoCode: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("@/lib/rate-limit", () => ({
  rateLimit: jest.fn(() => true),
  getClientIp: jest.fn(() => "127.0.0.1"),
}));

import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const findPromo = prisma.promoCode.findUnique as jest.Mock;
const rateLimitMock = rateLimit as jest.Mock;

/* ── Helpers ─────────────────────────────────────────────────────────── */

function makeRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/promo/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/* ── Tests ────────────────────────────────────────────────────────────── */

describe("POST /api/promo/validate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    rateLimitMock.mockReturnValue(true);
  });

  it("retourne 429 si rate-limité", async () => {
    rateLimitMock.mockReturnValue(false);
    const res = await POST(makeRequest({ code: "TEST10" }));
    expect(res.status).toBe(429);
  });

  it("retourne 400 si le body n'est pas du JSON valide", async () => {
    const req = new Request("http://localhost:3000/api/promo/validate", {
      method: "POST",
      body: "not json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("retourne 400 si le code est vide", async () => {
    const res = await POST(makeRequest({ code: "" }));
    expect(res.status).toBe(400);
  });

  it("retourne valid=false si le code n'existe pas", async () => {
    findPromo.mockResolvedValue(null);
    const res = await POST(makeRequest({ code: "INEXISTANT" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.valid).toBe(false);
  });

  it("retourne valid=false si le code est désactivé", async () => {
    findPromo.mockResolvedValue({
      code: "EXPIRE",
      isActive: false,
      startDate: null,
      endDate: null,
      type: "PERCENT",
      value: 10,
    });
    const res = await POST(makeRequest({ code: "EXPIRE" }));
    const body = await res.json();
    expect(body.valid).toBe(false);
  });

  it("retourne valid=false si le code n'a pas encore commencé", async () => {
    const future = new Date("2099-01-01");
    findPromo.mockResolvedValue({
      code: "FUTUR",
      isActive: true,
      startDate: future,
      endDate: null,
      type: "PERCENT",
      value: 15,
    });
    const res = await POST(makeRequest({ code: "FUTUR" }));
    const body = await res.json();
    expect(body.valid).toBe(false);
  });

  it("retourne valid=false si le code est expiré", async () => {
    const past = new Date("2020-01-01");
    findPromo.mockResolvedValue({
      code: "OLD",
      isActive: true,
      startDate: null,
      endDate: past,
      type: "FIXED",
      value: 50,
    });
    const res = await POST(makeRequest({ code: "OLD" }));
    const body = await res.json();
    expect(body.valid).toBe(false);
  });

  it("retourne valid=true avec les détails pour un code actif", async () => {
    findPromo.mockResolvedValue({
      code: "SUMMER20",
      isActive: true,
      startDate: new Date("2020-01-01"),
      endDate: new Date("2099-12-31"),
      type: "PERCENT",
      value: 20,
      minNights: 3,
      description: "Été 20%",
    });
    const res = await POST(makeRequest({ code: "summer20" }));
    const body = await res.json();
    expect(body.valid).toBe(true);
    expect(body.type).toBe("PERCENT");
    expect(body.value).toBe(20);
    expect(body.minNights).toBe(3);
    expect(body.description).toBe("Été 20%");
  });

  it("le code est converti en majuscules", async () => {
    findPromo.mockResolvedValue(null);
    await POST(makeRequest({ code: "test" }));
    expect(findPromo).toHaveBeenCalledWith({
      where: { code: "TEST" },
    });
  });
});
