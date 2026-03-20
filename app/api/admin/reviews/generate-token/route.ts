import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isAdmin } from "@/lib/auth";
import { randomBytes } from "crypto";

/**
 * POST /api/admin/reviews/generate-token
 * Génère un reviewToken pour une réservation (admin uniquement).
 * Body: { reservationId: number }
 * Retourne le lien complet vers la page d'avis.
 */
export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { reservationId } = await req.json();

    if (!reservationId || typeof reservationId !== "number") {
      return NextResponse.json(
        { error: "reservationId requis (number)" },
        { status: 400 },
      );
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { review: true },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Réservation introuvable" },
        { status: 404 },
      );
    }

    if (reservation.review) {
      return NextResponse.json(
        { error: "Un avis existe déjà pour cette réservation" },
        { status: 409 },
      );
    }

    /* Générer un token unique */
    const token = randomBytes(32).toString("hex");

    await prisma.reservation.update({
      where: { id: reservationId },
      data: { reviewToken: token },
    });

    const locale = reservation.locale === "EN" ? "en" : "fr";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const reviewUrl = `${appUrl}/${locale}/avis/${token}`;

    return NextResponse.json({
      success: true,
      token,
      reviewUrl,
      guestName: reservation.guestName,
      guestEmail: reservation.guestEmail,
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
