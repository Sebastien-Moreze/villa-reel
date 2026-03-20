import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

/* ── GET /api/reviews — Avis publics approuvés ──────────────────────── */

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        guestName: true,
        rating: true,
        ratingCleanliness: true,
        ratingComfort: true,
        ratingLocation: true,
        ratingCommunication: true,
        comment: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ reviews });
  } catch {
    return NextResponse.json(
      { error: "Impossible de charger les avis." },
      { status: 500 },
    );
  }
}

/* ── POST /api/reviews — Soumission d'un avis via token unique ──────── */

const reviewSchema = z.object({
  token: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  ratingCleanliness: z.number().int().min(1).max(5),
  ratingComfort: z.number().int().min(1).max(5),
  ratingLocation: z.number().int().min(1).max(5),
  ratingCommunication: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = reviewSchema.parse(body);

    /* Trouver la réservation via le token */
    const reservation = await prisma.reservation.findUnique({
      where: { reviewToken: data.token },
      include: { review: true },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Lien invalide ou expiré." },
        { status: 404 },
      );
    }

    /* Vérifier que la réservation est confirmée et le séjour terminé */
    if (reservation.status !== "CONFIRMED") {
      return NextResponse.json(
        { error: "Seules les réservations confirmées peuvent recevoir un avis." },
        { status: 400 },
      );
    }

    if (new Date() < reservation.checkOut) {
      return NextResponse.json(
        { error: "Vous pourrez laisser un avis après votre séjour." },
        { status: 400 },
      );
    }

    /* Vérifier qu'aucun avis n'existe déjà */
    if (reservation.review) {
      return NextResponse.json(
        { error: "Un avis a déjà été déposé pour cette réservation." },
        { status: 409 },
      );
    }

    /* Créer l'avis + invalider le token */
    const review = await prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: {
          villaId: reservation.villaId,
          reservationId: reservation.id,
          guestName: reservation.guestName,
          rating: data.rating,
          ratingCleanliness: data.ratingCleanliness,
          ratingComfort: data.ratingComfort,
          ratingLocation: data.ratingLocation,
          ratingCommunication: data.ratingCommunication,
          comment: data.comment || null,
          status: "PENDING",
        },
      });

      /* Supprimer le token pour empêcher une double soumission */
      await tx.reservation.update({
        where: { id: reservation.id },
        data: { reviewToken: null },
      });

      return created;
    });

    return NextResponse.json(
      { success: true, reviewId: review.id },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides.", details: err.flatten().fieldErrors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 },
    );
  }
}
