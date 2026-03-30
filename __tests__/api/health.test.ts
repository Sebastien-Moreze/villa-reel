/**
 * Tests pour GET /api/health
 */
import { GET } from "@/app/api/health/route";

/* ── Mocks ──────────────────────────────────────────────────────────── */

const mockQueryRaw = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRaw: (...args: unknown[]) => mockQueryRaw(...args),
  },
}));

/* ── Tests ────────────────────────────────────────────────────────────── */

describe("GET /api/health", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retourne status ok quand la DB est connectée", async () => {
    mockQueryRaw.mockResolvedValue([{ "?column?": 1 }]);

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body.db).toBe("connected");
    expect(typeof body.uptime).toBe("number");
    expect(typeof body.responseTimeMs).toBe("number");
  });

  it("retourne 503 quand la DB est déconnectée", async () => {
    mockQueryRaw.mockRejectedValue(new Error("Connection refused"));

    const res = await GET();
    expect(res.status).toBe(503);
  });
});
