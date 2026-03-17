import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

const reservationSchema = z.object({
  villaId: z.number().int().positive(),
  checkIn: z.string().nonempty(),
  checkOut: z.string().nonempty(),
  nbGuests: z.number().int().positive(),
  guestName: z.string().min(1),
  guestEmail: z.string().email(),
  guestPhone: z.string().optional(),
  guestAddress: z.string().optional(),
  pricePerNight: z.number().positive(),
  cleaningFee: z.number().nonnegative(),
  discount: z.number().nonnegative().optional(),
  totalAmount: z.number().positive(),
  depositAmount: z.number().positive(),
  balanceAmount: z.number().nonnegative(),
  promoCode: z.string().optional(),
  locale: z.enum(["fr", "en"]).default("fr"),
});

function overlaps(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date,
): boolean {
  return startA < endB && startB < endA;
}

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = reservationSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;

  const checkIn = new Date(data.checkIn);
  const checkOut = new Date(data.checkOut);

  if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
    return NextResponse.json(
      { error: "Invalid dates" },
      { status: 400 },
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existingBlocked = await tx.blockedDate.findMany({
        where: { villaId: data.villaId },
      });
      const existingReservations = await tx.reservation.findMany({
        where: {
          villaId: data.villaId,
          status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
        },
      });

      const hasConflict =
        existingBlocked.some((b) =>
          overlaps(checkIn, checkOut, b.startDate, b.endDate),
        ) ||
        existingReservations.some((r) =>
          overlaps(checkIn, checkOut, r.checkIn, r.checkOut),
        );

      if (hasConflict) {
        throw new Error("DATES_UNAVAILABLE");
      }

      let promoCodeRecord = null;
      if (data.promoCode) {
        promoCodeRecord = await tx.promoCode.findUnique({
          where: { code: data.promoCode.toUpperCase() },
        });
      }

      const confirmationCode = await generateUniqueConfirmationCode(tx);

      const reservation = await tx.reservation.create({
        data: {
          villaId: data.villaId,
          confirmationCode,
          guestName: data.guestName,
          guestEmail: data.guestEmail,
          guestPhone: data.guestPhone,
          guestAddress: data.guestAddress,
          checkIn,
          checkOut,
          nbGuests: data.nbGuests,
          nbNights: Math.max(
            1,
            Math.round(
              (checkOut.getTime() - checkIn.getTime()) /
                (1000 * 60 * 60 * 24),
            ),
          ),
          pricePerNight: data.pricePerNight,
          cleaningFee: data.cleaningFee,
          discount: data.discount ?? 0,
          totalAmount: data.totalAmount,
          depositAmount: data.depositAmount,
          balanceAmount: data.balanceAmount,
          status: "PENDING",
          paymentStatus: "AWAITING",
          promoCodeId: promoCodeRecord?.id,
          locale: data.locale === "en" ? "EN" : "FR",
        },
      });

      return reservation;
    });

    return NextResponse.json({ reservationId: result.id, confirmationCode: result.confirmationCode });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "DATES_UNAVAILABLE") {
      return NextResponse.json(
        { error: "Dates not available" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create reservation" },
      { status: 500 },
    );
  }
}

async function generateUniqueConfirmationCode(tx: Prisma.TransactionClient) {
  // Simple REEL-XXXXXX code
  while (true) {
    const random = Math.floor(Math.random() * 1_000_000)
      .toString()
      .padStart(6, "0");
    const code = `REEL-${random}`;
    const existing = await tx.reservation.findUnique({
      where: { confirmationCode: code },
    });
    if (!existing) return code;
  }
}

