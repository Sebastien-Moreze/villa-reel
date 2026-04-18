import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { apiError } from "@/lib/http-error";
import { generateHouseRulesPdf } from "@/lib/house-rules-pdf";
import { Resend } from "resend";

function verifyCronSecret(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const customHeader = request.headers.get("x-cron-secret");
  if (!cronSecret) return false;
  if (authHeader === `Bearer ${cronSecret}`) return true;
  if (customHeader === cronSecret) return true;
  return false;
}

async function handleCatchUp() {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) return apiError.serverError("RESEND_API_KEY is not configured");

  const resend = new Resend(resendApiKey);
  const fromEmail = process.env.CONTACT_EMAIL ?? "no-reply@villareel.com";
  const now = new Date();

  const reservations = await prisma.reservation.findMany({
    where: {
      checkIn: { gt: now },
      status: { in: ["PENDING", "CONFIRMED"] },
      houseRulesSentAt: null, // Ne renvoyer qu'aux réservations qui n'ont pas encore reçu le règlement
    },
  });

  if (reservations.length === 0) return NextResponse.json({ found: 0, sent: 0 });

  const [pdfFr, pdfEn] = await Promise.all([
    generateHouseRulesPdf("fr"),
    generateHouseRulesPdf("en"),
  ]);
  const pdfFrBase64 = pdfFr.toString("base64");
  const pdfEnBase64 = pdfEn.toString("base64");

  let sent = 0;
  const errors: { reservationId: number; error: string }[] = [];

  for (const reservation of reservations) {
    const locale = reservation.locale === "EN" ? "en" : "fr";
    const isFr = locale === "fr";

    try {
      await resend.emails.send({
        from: `Villa R.E.E.L <${fromEmail}>`,
        to: reservation.guestEmail,
        subject: isFr ? "Règlement intérieur – Villa R.E.E.L" : "House Rules – Villa R.E.E.L",
        html: isFr
          ? `<p>Bonjour ${reservation.guestName},</p><p>Veuillez trouver ci-joint le règlement intérieur de la Villa R.E.E.L, en vue de votre séjour du <strong>${reservation.checkIn.toLocaleDateString("fr-FR")}</strong> au <strong>${reservation.checkOut.toLocaleDateString("fr-FR")}</strong>.</p><p>Nous vous invitons à en prendre connaissance avant votre arrivée.</p><p>À très bientôt,<br/>L'équipe Villa R.E.E.L</p>`
          : `<p>Hello ${reservation.guestName},</p><p>Please find attached the house rules for Villa R.E.E.L, ahead of your stay from <strong>${reservation.checkIn.toLocaleDateString("en-GB")}</strong> to <strong>${reservation.checkOut.toLocaleDateString("en-GB")}</strong>.</p><p>Please review them before your arrival.</p><p>See you soon,<br/>The Villa R.E.E.L team</p>`,
        attachments: [{
          filename: isFr ? "reglement-interieur.pdf" : "house-rules.pdf",          content: isFr ? pdfFrBase64 : pdfEnBase64,
        }],
      });

      // Marquer comme envoyé pour ne plus renvoyer les jours suivants
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: { houseRulesSentAt: new Date() },
      });

      sent++;
      logger.info("Catch-up: house rules sent", { reservationId: reservation.id, guestEmail: reservation.guestEmail });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      errors.push({ reservationId: reservation.id, error: msg });
      logger.error("Catch-up: failed to send house rules", { route: "/api/reservations/catch-up-house-rules", reservationId: reservation.id, error });
    }
  }

  return NextResponse.json({ found: reservations.length, sent, errors: errors.length > 0 ? errors : undefined });
}

export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) return apiError.unauthorized();
  return handleCatchUp();
}

export async function POST(request: NextRequest) {
  if (!verifyCronSecret(request)) return apiError.unauthorized();
  return handleCatchUp();
}