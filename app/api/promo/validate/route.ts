import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    code?: string;
    villaId?: number;
    checkIn?: string;
    checkOut?: string;
  };

  const code = body.code?.trim().toUpperCase();
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

