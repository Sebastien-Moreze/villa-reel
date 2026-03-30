/**
 * Tests pour GET /api/villa/booking-info
 */
import { GET } from "@/app/api/villa/booking-info/route";

/* ── Mocks ──────────────────────────────────────────────────────────── */

jest.mock("@/lib/prisma", () => ({
  prisma: {
    villa: {
      findUnique: jest.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
const findUnique = prisma.villa.findUnique as jest.Mock;

/* ── Helpers ─────────────────────────────────────────────────────────── */

function makeRequest(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost:3000/api/villa/booking-info");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new Request(url.toString());
}

/* ── Tests ────────────────────────────────────────────────────────────── */

describe("GET /api/villa/booking-info", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retourne 400 si villaId est manquant", async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(400);
  });

  it("retourne 404 si la villa n'existe pas", async () => {
    findUnique.mockResolvedValue(null);
    const res = await GET(makeRequest({ villaId: "999" }));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toContain("not found");
  });

  it("retourne les infos de la villa", async () => {
    findUnique.mockResolvedValue({
      maxGuests: 14,
      minStay: 2,
      maxStay: 21,
      pricePerNight: 450,
      cleaningFee: 200,
      deposit: 500,
    });

    const res = await GET(makeRequest({ villaId: "1" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      maxGuests: 14,
      minStay: 2,
      maxStay: 21,
      pricePerNight: 450,
      cleaningFee: 200,
      deposit: 500,
    });
  });

  it("convertit les Decimal Prisma en Number", async () => {
    // Prisma Decimal objects have toString
    findUnique.mockResolvedValue({
      maxGuests: 14,
      minStay: 2,
      maxStay: 21,
      pricePerNight: { toString: () => "450.00" },
      cleaningFee: { toString: () => "200.00" },
      deposit: { toString: () => "500.00" },
    });

    const res = await GET(makeRequest({ villaId: "1" }));
    const body = await res.json();
    expect(typeof body.pricePerNight).toBe("number");
    expect(typeof body.cleaningFee).toBe("number");
    expect(typeof body.deposit).toBe("number");
  });
});
