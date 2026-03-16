import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const villaIdParam = searchParams.get("villaId");
  const villaId = villaIdParam ? Number(villaIdParam) : NaN;

  if (!villaId || Number.isNaN(villaId)) {
    return NextResponse.json(
      { error: "Missing or invalid villaId" },
      { status: 400 },
    );
  }

  const villa = await prisma.villa.findUnique({
    where: { id: villaId },
    select: {
      maxGuests: true,
      minStay: true,
      maxStay: true,
      pricePerNight: true,
      cleaningFee: true,
      deposit: true,
    },
  });

  if (!villa) {
    return NextResponse.json({ error: "Villa not found" }, { status: 404 });
  }

  return NextResponse.json({
    maxGuests: villa.maxGuests,
    minStay: villa.minStay,
    maxStay: villa.maxStay,
    pricePerNight: Number(villa.pricePerNight),
    cleaningFee: Number(villa.cleaningFee),
    deposit: Number(villa.deposit),
  });
}

