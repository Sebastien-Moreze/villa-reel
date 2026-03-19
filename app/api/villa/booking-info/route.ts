import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/http-error";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const villaIdParam = searchParams.get("villaId");
  const villaId = villaIdParam ? Number(villaIdParam) : NaN;

  if (!villaId || Number.isNaN(villaId)) {
    return apiError.badRequest("Missing or invalid villaId");
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
    return apiError.notFound("Villa not found");
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

