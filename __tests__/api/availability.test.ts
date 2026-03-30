/**
 * Tests pour GET /api/availability
 */
import { GET } from "@/app/api/availability/route";

/* ── Mocks ──────────────────────────────────────────────────────────── */

// Mock prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    blockedDate: {
      findMany: jest.fn(),
    },
    reservation: {
      findMany: jest.fn(),
    },
  },
}));

// Mock unstable_cache — exécute directement la fonction sans mise en cache
jest.mock("next/cache", () => ({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  unstable_cache: (fn: Function) => fn,
}));

import { prisma } from "@/lib/prisma";

const blockedDateFindMany = prisma.blockedDate.findMany as jest.Mock;
const reservationFindMany = prisma.reservation.findMany as jest.Mock;

/* ── Helpers ─────────────────────────────────────────────────────────── */

function makeRequest(params: Record<string, string> = {}): Request {
  const url = new URL("http://localhost:3000/api/availability");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return new Request(url.toString());
}

/* ── Tests ────────────────────────────────────────────────────────────── */

describe("GET /api/availability", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    blockedDateFindMany.mockResolvedValue([]);
    reservationFindMany.mockResolvedValue([]);
  });

  it("retourne 400 si villaId est manquant", async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("villaId");
  });

  it("retourne 400 si villaId n'est pas un nombre", async () => {
    const res = await GET(makeRequest({ villaId: "abc" }));
    expect(res.status).toBe(400);
  });

  it("retourne les dates bloquées et réservations", async () => {
    blockedDateFindMany.mockResolvedValue([
      {
        startDate: new Date("2026-07-01"),
        endDate: new Date("2026-07-05"),
      },
    ]);
    reservationFindMany.mockResolvedValue([
      {
        checkIn: new Date("2026-08-10"),
        checkOut: new Date("2026-08-15"),
      },
    ]);

    const res = await GET(makeRequest({ villaId: "1" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.blocked).toHaveLength(2);
    expect(body.blocked[0]).toEqual({
      startDate: "2026-07-01",
      endDate: "2026-07-05",
    });
    expect(body.blocked[1]).toEqual({
      startDate: "2026-08-10",
      endDate: "2026-08-15",
    });
  });

  it("retourne un tableau vide si aucune donnée", async () => {
    const res = await GET(makeRequest({ villaId: "1" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.blocked).toEqual([]);
  });

  it("retourne 500 en cas d'erreur Prisma", async () => {
    blockedDateFindMany.mockRejectedValue(new Error("DB down"));

    const res = await GET(makeRequest({ villaId: "1" }));
    expect(res.status).toBe(500);
  });
});
