import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

const getAvailability = unstable_cache(
  async (villaId: number, year?: number, month?: number) => {
    const whereDateRange =
      year && month
        ? {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59, 999),
          }
        : undefined;

    const [blockedDates, reservations] = await Promise.all([
      prisma.blockedDate.findMany({
        where: {
          villaId,
          ...(whereDateRange && {
            OR: [
              {
                startDate: whereDateRange,
              },
              {
                endDate: whereDateRange,
              },
            ],
          }),
        },
        select: { startDate: true, endDate: true },
        orderBy: { startDate: "asc" },
      }),
      prisma.reservation.findMany({
        where: {
          villaId,
          status: { in: ["CONFIRMED", "COMPLETED"] },
          ...(whereDateRange && {
            OR: [
              {
                checkIn: whereDateRange,
              },
              {
                checkOut: whereDateRange,
              },
            ],
          }),
        },
        select: { checkIn: true, checkOut: true },
        orderBy: { checkIn: "asc" },
      }),
    ]);

    const blocked = [
      ...blockedDates.map((b) => ({
        startDate: b.startDate.toISOString().split("T")[0],
        endDate: b.endDate.toISOString().split("T")[0],
      })),
      ...reservations.map((r) => ({
        startDate: r.checkIn.toISOString().split("T")[0],
        endDate: r.checkOut.toISOString().split("T")[0],
      })),
    ];

    return { blocked };
  },
  ["availability"],
  { revalidate: 300, tags: ["availability"] },
);

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

  const yearParam = searchParams.get("year");
  const monthParam = searchParams.get("month");
  const year = yearParam ? Number(yearParam) : undefined;
  const month = monthParam ? Number(monthParam) : undefined;

  try {
    const data = await getAvailability(villaId, year, month);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 },
    );
  }
}

