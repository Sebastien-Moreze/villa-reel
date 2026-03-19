import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { apiError } from "@/lib/http-error";

/* ── Schéma Zod ───────────────────────────────────────────────── */
const schema = z.object({
  code: z.string().min(1).max(50).trim().toUpperCase(),
  villaId: z.number().int().positive().optional(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
});

export async function POST(request: Request) {
  /* ── Rate limiting : 20 requêtes / IP / minute ────────────────── */
  const ip = getClientIp(request);
  if (!rateLimit(`promo-validate:${ip}`, 20, 60_000)) {
    return apiError.tooManyRequests();
  }

  /* ── Parse + validation ───────────────────────────────────────── */
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return apiError.badRequest("Invalid JSON");
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return apiError.badRequest("Code promo invalide");
  }

  const { code } = parsed.data;

  const now = new Date();

  const promo = await prisma.promoCode.findUnique({ where: { code } });

  if (
    !promo ||
    !promo.isActive ||
    (promo.startDate && promo.startDate > now) ||
    (promo.endDate && promo.endDate < now)
  ) {
    return NextResponse.json({ valid: false });
  }

  return NextResponse.json({
    valid: true,
    type: promo.type,
    value: Number(promo.value),
    minNights: promo.minNights ?? null,
    description: promo.description ?? null,
  });
}
