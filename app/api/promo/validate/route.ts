import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // ── Rate limiting : 20 requêtes par IP par minute ─────────────────────────
  // Empêche le brute-force des codes promo
  const ip = getClientIp(request);
  if (!rateLimit(`promo-validate:${ip}`, 20, 60_000)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 },
    );
  }

  const body = (await request.json()) as {
    code?: string;
    villaId?: number;
    checkIn?: string;
    checkOut?: string;
  };

  const code = body.code?.trim().toUpperCase().slice(0, 50);
  if (!code) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const now = new Date();

  const promo = await prisma.promoCode.findUnique({
    where: { code },
  });

  if (
    !promo ||
    !promo.isActive ||
    (promo.startDate && promo.startDate > now) ||
    (promo.endDate && promo.endDate < now)
  ) {
    return NextResponse.json({ valid: false }, { status: 200 });
  }

  return NextResponse.json({
    valid: true,
    type: promo.type,
    value: Number(promo.value),
    minNights: promo.minNights ?? null,
    description: promo.description ?? null,
  });
}
