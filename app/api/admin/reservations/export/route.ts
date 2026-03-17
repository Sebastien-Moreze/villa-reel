import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isAdmin } from "@/lib/auth";
import { ReservationStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  await requireAuth();
  const admin = await isAdmin();
  if (!admin) {
    return new Response("Accès refusé", { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as ReservationStatus | null;
  const q = searchParams.get("q")?.trim();

  const where = {
    ...(status && status !== ("ALL" as ReservationStatus) && { status }),
    ...(q && {
      OR: [
        { guestName: { contains: q, mode: "insensitive" as const } },
        { guestEmail: { contains: q, mode: "insensitive" as const } },
        { confirmationCode: { contains: q, mode: "insensitive" as const } },
      ],
    }),
  };

  const reservations = await prisma.reservation.findMany({
    where,
    orderBy: { checkIn: "desc" },
    include: { villa: true, promoCode: true },
  });

  const headers = [
    "id",
    "confirmationCode",
    "guestName",
    "guestEmail",
    "guestPhone",
    "villa",
    "checkIn",
    "checkOut",
    "nbNights",
    "nbGuests",
    "pricePerNight",
    "cleaningFee",
    "discount",
    "totalAmount",
    "depositAmount",
    "balanceAmount",
    "status",
    "paymentStatus",
    "promoCode",
    "createdAt",
  ];

  const escape = (v: unknown) => {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const rows = [
    headers.join(","),
    ...reservations.map((r) =>
      [
        r.id,
        r.confirmationCode,
        r.guestName,
        r.guestEmail,
        r.guestPhone ?? "",
        r.villa.nameFr,
        r.checkIn.toISOString().split("T")[0],
        r.checkOut.toISOString().split("T")[0],
        r.nbNights,
        r.nbGuests,
        r.pricePerNight.toString(),
        r.cleaningFee.toString(),
        r.discount?.toString() ?? "0",
        r.totalAmount.toString(),
        r.depositAmount?.toString() ?? "0",
        r.balanceAmount?.toString() ?? "0",
        r.status,
        r.paymentStatus,
        r.promoCode?.code ?? "",
        r.createdAt.toISOString(),
      ]
        .map(escape)
        .join(",")
    ),
  ].join("\r\n");

  const filename = `reservations_villareel_${new Date().toISOString().split("T")[0]}.csv`;

  return new Response("\uFEFF" + rows, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
