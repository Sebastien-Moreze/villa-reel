import { prisma } from "@/lib/prisma";
import { requireAuth, isAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sendBalanceReminderEmail } from "@/lib/emails";
import { logger } from "@/lib/logger";
import Link from "next/link";
import { CautionActions } from "./CautionActions";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ReservationDetailPage({ params }: PageProps) {
  await requireAuth();
  const admin = await isAdmin();
  if (!admin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-neutral-400">
        Accès refusé.
      </div>
    );
  }

  const { id: idStr } = await params;
  const id = Number(idStr);
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { villa: true, promoCode: true, review: true },
  });

  if (!reservation) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-sm text-neutral-300">
        Réservation introuvable.
      </div>
    );
  }

  const now = new Date();

  const timeline = [
    { label: "Réservation créée",         date: reservation.createdAt,  done: true,                                                                    color: "bg-primary" },
    { label: "Acompte 30% encaissé",       date: null as Date | null,    done: ["DEPOSIT_PAID","FULLY_PAID","REFUNDED"].includes(reservation.paymentStatus), color: "bg-secondary" },
    { label: `Solde dû (J-30)`,            date: null as Date | null,    done: reservation.paymentStatus === "FULLY_PAID",                              color: "bg-secondary" },
    { label: `Arrivée ${reservation.checkIn.toLocaleDateString("fr-FR")}`,  date: reservation.checkIn,  done: reservation.checkIn <= now,  color: "bg-yellow-500" },
    { label: `Départ ${reservation.checkOut.toLocaleDateString("fr-FR")}`, date: reservation.checkOut, done: reservation.checkOut <= now, color: "bg-cta"         },
    { label: "Séjour terminé",             date: null as Date | null,    done: reservation.status === "COMPLETED",                                      color: "bg-neutral-500" },
  ];

  const expectedEmails = [
    { label: "Confirmation de réservation", desc: "À la création / confirmation",           sent: ["CONFIRMED","COMPLETED"].includes(reservation.status) },
    { label: "Rappel solde (J-35)",          desc: "35 jours avant l'arrivée (automatique)", sent: ["FULLY_PAID","REFUNDED"].includes(reservation.paymentStatus) },
    { label: "Confirmation solde payé",      desc: "Après encaissement du solde",             sent: reservation.paymentStatus === "FULLY_PAID" },
    { label: "Rappel d'arrivée",             desc: "3 jours avant l'arrivée",                sent: reservation.checkIn <= now },
    { label: "Demande d'avis",               desc: "2 jours après le départ",                sent: reservation.checkOut < now && reservation.status === "COMPLETED" },
  ];

  const statusCls: Record<string, string> = {
    PENDING:   "bg-yellow-400/10 text-yellow-400",
    CONFIRMED: "bg-primary/20 text-primary",
    CANCELLED: "bg-cta/10 text-cta",
    COMPLETED: "bg-secondary/20 text-secondary",
  };
  const paymentCls: Record<string, string> = {
    AWAITING:     "bg-yellow-400/10 text-yellow-400",
    DEPOSIT_PAID: "bg-blue-400/10 text-blue-400",
    FULLY_PAID:   "bg-primary/20 text-primary",
    REFUNDED:     "bg-neutral-700 text-neutral-400",
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/admin/reservations"
            className="text-[11px] text-neutral-500 hover:text-neutral-300"
          >
            ← Réservations
          </Link>
          <h1 className="mt-1 text-lg font-semibold text-neutral-50">{reservation.confirmationCode}</h1>
          <p className="text-[11px] text-neutral-400">{reservation.guestName} · {reservation.villa.nameFr}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusCls[reservation.status]}`}>
            {reservation.status}
          </span>
          <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${paymentCls[reservation.paymentStatus]}`}>
            {reservation.paymentStatus}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[1.4fr,1fr]">
        {/* Gauche */}
        <div className="space-y-4">
          <Card title="Voyageur">
            <Row label="Nom"        value={reservation.guestName} />
            <Row label="Email"      value={reservation.guestEmail} />
            {reservation.guestPhone   && <Row label="Téléphone" value={reservation.guestPhone} />}
            {reservation.guestAddress && <Row label="Adresse"   value={reservation.guestAddress} />}
            <Row label="Séjour" value={`${reservation.checkIn.toLocaleDateString("fr-FR")} → ${reservation.checkOut.toLocaleDateString("fr-FR")} · ${reservation.nbNights} nuits · ${reservation.nbGuests} pers.`} />
            <Row label="Langue" value={reservation.locale} />
            {reservation.promoCode && (
              <Row label="Promo" value={`${reservation.promoCode.code} (${reservation.promoCode.type === "PERCENT" ? `−${reservation.promoCode.value}%` : `−${reservation.promoCode.value} €`})`} />
            )}
          </Card>

          <Card title="Finances">
            <Row label="Prix / nuit"  value={`${Number(reservation.pricePerNight).toLocaleString("fr-FR")} €`} />
            <Row label="Ménage"       value={`${Number(reservation.cleaningFee).toLocaleString("fr-FR")} €`} />
            {Number(reservation.discount ?? 0) > 0 && (
              <Row label="Remise" value={`−${Number(reservation.discount).toLocaleString("fr-FR")} €`} highlight />
            )}
            <Row label="Total TTC"    value={`${Number(reservation.totalAmount).toLocaleString("fr-FR")} €`} bold />
            <Row label="Solde dû"     value={`${Number(reservation.balanceAmount ?? reservation.totalAmount).toLocaleString("fr-FR")} €`} />
            {reservation.stripePaymentIntentId && (
              <Row label="Stripe ID" value={reservation.stripePaymentIntentId} mono />
            )}
          </Card>

          {/* ── Bloc Caution ──────────────────────────────────────────── */}
          <CautionCard reservation={reservation as unknown as AnyReservation} />

          <Card title="Actions">
            <div className="flex flex-wrap gap-2 pt-1">
              {reservation.paymentStatus === "DEPOSIT_PAID" && (
                <form action={markAsPaid}>
                  <input type="hidden" name="id" value={id} />
                  <button className="rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-white hover:opacity-90">
                    Marquer solde payé
                  </button>
                </form>
              )}
              {reservation.status === "PENDING" && (
                <form action={confirmAction}>
                  <input type="hidden" name="id" value={id} />
                  <button className="rounded-full border border-primary px-3 py-1.5 text-[11px] text-primary hover:bg-primary/10">
                    Confirmer
                  </button>
                </form>
              )}
              {["DEPOSIT_PAID", "AWAITING"].includes(reservation.paymentStatus) && reservation.status === "CONFIRMED" && (
                <form action={sendBalanceReminder}>
                  <input type="hidden" name="id" value={id} />
                  <button className="rounded-full border border-secondary px-3 py-1.5 text-[11px] text-secondary hover:bg-secondary/10">
                    Envoyer lien paiement solde
                  </button>
                </form>
              )}
              {reservation.status === "COMPLETED" && !reservation.review && (
                <form action={sendReviewRequest}>
                  <input type="hidden" name="id" value={id} />
                  <button className="rounded-full border border-neutral-700 px-3 py-1.5 text-[11px] text-neutral-300 hover:border-secondary hover:text-secondary">
                    Demander un avis
                  </button>
                </form>
              )}
              {["PENDING","CONFIRMED"].includes(reservation.status) && (
                <form action={cancelAction}>
                  <input type="hidden" name="id" value={id} />
                  <button className="rounded-full border border-neutral-700 px-3 py-1.5 text-[11px] text-neutral-400 hover:border-cta hover:text-cta">
                    Annuler
                  </button>
                </form>
              )}
              {["DEPOSIT_PAID","FULLY_PAID"].includes(reservation.paymentStatus) && reservation.stripePaymentIntentId && (
                <form action={processRefund}>
                  <input type="hidden" name="id" value={id} />
                  <button className="rounded-full border border-neutral-700 px-3 py-1.5 text-[11px] text-neutral-400 hover:border-cta hover:text-cta">
                    Rembourser via Stripe
                  </button>
                </form>
              )}
            </div>
          </Card>
        </div>

        {/* Droite */}
        <div className="space-y-4">
          <Card title="Timeline">
            <ol className="relative border-l border-neutral-800 pl-4 space-y-3 pt-1">
              {timeline.map((step, i) => (
                <li key={i} className="relative">
                  <span className={`absolute -left-[21px] mt-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-neutral-900 ${step.done ? step.color : "bg-neutral-800"}`} />
                  <p className={`text-[11px] font-semibold ${step.done ? "text-neutral-100" : "text-neutral-600"}`}>{step.label}</p>
                  {step.date && (
                    <p className="text-[10px] text-neutral-500">
                      {step.date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </Card>

          <Card title="Emails">
            <ul className="space-y-2 pt-1">
              {expectedEmails.map((e, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className={`mt-0.5 text-sm leading-none ${e.sent ? "text-primary" : "text-neutral-700"}`}>
                    {e.sent ? "✓" : "○"}
                  </span>
                  <div>
                    <p className={`text-[11px] font-semibold ${e.sent ? "text-neutral-200" : "text-neutral-600"}`}>{e.label}</p>
                    <p className="text-[10px] text-neutral-500">{e.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          {reservation.review && (
            <Card title="Avis client">
              <div className="flex gap-0.5 pt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < reservation.review!.rating ? "text-yellow-400" : "text-neutral-700"}>★</span>
                ))}
                <span className="ml-1 text-[10px] text-neutral-500">({reservation.review.rating}/5)</span>
              </div>
              {reservation.review.comment && (
                <p className="mt-2 text-[11px] italic text-neutral-300">&ldquo;{reservation.review.comment}&rdquo;</p>
              )}
              <p className={`mt-1 text-[10px] ${reservation.review.status === "APPROVED" ? "text-primary" : "text-yellow-400"}`}>
                {reservation.review.status}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Server Actions ────────────────────────────────────────────────────────

async function markAsPaid(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  await prisma.reservation.update({ where: { id }, data: { paymentStatus: "FULLY_PAID", status: "CONFIRMED" } });
  revalidatePath(`/admin/reservations/${id}`);
}

async function confirmAction(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  await prisma.reservation.update({ where: { id }, data: { status: "CONFIRMED" } });
  revalidatePath(`/admin/reservations/${id}`);
}

async function cancelAction(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  await prisma.reservation.update({
    where: { id },
    data: { status: "CANCELLED", cancellationReason: "Annulée depuis le backoffice admin", cancelledAt: new Date() },
  });
  revalidatePath(`/admin/reservations/${id}`);
}

async function sendBalanceReminder(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  const reservation = await prisma.reservation.findUnique({ where: { id } });
  if (!reservation) return;

  const balanceAmount = Number(reservation.balanceAmount ?? 0);
  if (balanceAmount <= 0) return;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://villareel.com";
  const locale = reservation.locale === "EN" ? "en" : "fr";

  // Crée une nouvelle Checkout Session Stripe (fraîche, 72h de validité)
  const StripeLib = (await import("stripe")).default;
  const stripe = new StripeLib(process.env.STRIPE_SK ?? "", {
    apiVersion: "2026-02-25.clover" as const,
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: `Solde séjour Villa R.E.E.L – ${reservation.confirmationCode}`,
          },
          unit_amount: Math.round(balanceAmount * 100),
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      metadata: {
        reservationId: String(reservation.id),
        villaId: String(reservation.villaId),
        type: "balance",
      },
    },
    success_url: `${appUrl}/${locale}/reservation/merci?code=${reservation.confirmationCode}`,
    cancel_url: `${appUrl}/${locale}/reservation?annule=1`,
    expires_at: Math.floor(Date.now() / 1000) + 72 * 60 * 60,
  });

  // Sauvegarde le nouvel intent en DB
  await prisma.reservation.update({
    where: { id },
    data: {
      stripePaymentIntentId: session.payment_intent
        ? String(session.payment_intent)
        : session.id,
    },
  });

  const balanceDue = new Date(reservation.checkIn);
  balanceDue.setDate(balanceDue.getDate() - 30);

  await sendBalanceReminderEmail({
    locale,
    to: reservation.guestEmail,
    confirmationCode: reservation.confirmationCode,
    balanceAmount,
    balanceDueDate: balanceDue.toLocaleDateString("fr-FR"),
    paymentUrl: session.url ?? `${appUrl}/${locale}/reservation`,
  });

  revalidatePath(`/admin/reservations/${id}`);
}

async function sendReviewRequest(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  const reservation = await prisma.reservation.findUnique({ where: { id } });
  if (!reservation) return;

  const { sendReviewRequestEmail } = await import("@/lib/emails");
  await sendReviewRequestEmail({
    locale: reservation.locale === "EN" ? "en" : "fr",
    to: reservation.guestEmail,
    guestName: reservation.guestName,
    reviewUrl: `${process.env.NEXT_PUBLIC_APP_URL}/avis/${reservation.confirmationCode}`,
  });
  revalidatePath(`/admin/reservations/${id}`);
}

async function processRefund(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  const reservation = await prisma.reservation.findUnique({ where: { id } });
  if (!reservation?.stripePaymentIntentId) return;

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SK ?? "", { apiVersion: "2026-02-25.clover" as const });
    await stripe.refunds.create({ payment_intent: reservation.stripePaymentIntentId });
    await prisma.reservation.update({
      where: { id },
      data: { paymentStatus: "REFUNDED", status: "CANCELLED", cancellationReason: "Remboursement via backoffice", cancelledAt: new Date() },
    });
  } catch (err) {
    logger.error("Stripe refund error", { error: err });
  }
  revalidatePath(`/admin/reservations/${id}`);
}

// ── CautionCard (Server Component) ───────────────────────────────────────

type AnyReservation = Record<string, unknown> & {
  id: number;
  checkOut: Date;
  cautionStatus: string;
  cautionDeadline: Date | null;
  cautionAmount: { toString: () => string } | null;
  cautionIntentId: string | null;
};

function CautionCard({ reservation }: { reservation: AnyReservation }) {
  const now = new Date();
  const cautionDeadlineExpired = reservation.cautionDeadline ? now > reservation.cautionDeadline : false;
  const hoursLeft = reservation.cautionDeadline && !cautionDeadlineExpired
    ? Math.max(0, Math.round((reservation.cautionDeadline.getTime() - now.getTime()) / 3_600_000))
    : null;

  const badge: Record<string, { label: string; cls: string }> = {
    NONE:     { label: "Non provisionnée",      cls: "bg-neutral-800 text-neutral-400" },
    HELD:     { label: "⏳ Provisionnée",        cls: "bg-amber-900/50 text-amber-300" },
    CAPTURED: { label: "⚡ Encaissée",           cls: "bg-red-900/50 text-red-300" },
    RELEASED: { label: "✓ Libérée",             cls: "bg-emerald-900/50 text-emerald-300" },
    EXPIRED:  { label: "Expirée",               cls: "bg-neutral-800 text-neutral-500" },
  };

  const b = badge[reservation.cautionStatus] ?? badge.NONE;

  return (
    <div className="rounded-2xl border border-neutral-800 bg-[#0c0c0c] p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-neutral-100">Caution</p>
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${b.cls}`}>
          {b.label}
        </span>
      </div>

      {/* Montant */}
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-neutral-500">Montant provisonné</span>
        <span className="font-semibold text-neutral-100">
          {reservation.cautionAmount
            ? `${Number(reservation.cautionAmount).toLocaleString("fr-FR")} €`
            : "—"}
        </span>
      </div>

      {/* Deadline */}
      {reservation.cautionDeadline && reservation.cautionStatus === "HELD" && (
        <div className={`rounded-lg px-3 py-2 text-[11px] ${
          cautionDeadlineExpired
            ? "border border-red-800 bg-red-950 text-red-300"
            : hoursLeft !== null && hoursLeft < 6
            ? "border border-amber-700 bg-amber-950 text-amber-300"
            : "border border-neutral-700 bg-neutral-900 text-neutral-400"
        }`}>
          {cautionDeadlineExpired
            ? "⚠ Délai dépassé — capture impossible."
            : `⏱ Agir avant le ${reservation.cautionDeadline.toLocaleString("fr-FR")} — ${hoursLeft}h restantes`}
        </div>
      )}

      {/* Instructions */}
      {reservation.cautionStatus === "HELD" && !cautionDeadlineExpired && (
        <p className="text-[10px] text-neutral-500 leading-relaxed">
          La caution est bloquée sur la carte du client. Encaissez-la en cas de dégradation, ou libérez-la si tout est en ordre.
        </p>
      )}

      {/* Boutons */}
      {reservation.cautionStatus === "HELD" && !cautionDeadlineExpired && (
        <CautionActions reservationId={reservation.id} cautionAmount={Number(reservation.cautionAmount ?? 0)} />
      )}

      {reservation.cautionStatus === "NONE" && !reservation.cautionIntentId && (
        <p className="text-[10px] text-neutral-600">Aucune autorisation de caution enregistrée.</p>
      )}
    </div>
  );
}

// ── Composants ───────────────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-[#0c0c0c] p-4">
      <p className="mb-3 text-xs font-semibold text-neutral-100">{title}</p>
      <div className="space-y-1.5 text-[11px]">{children}</div>
    </div>
  );
}

function Row({ label, value, bold, highlight, mono }: { label: string; value: string; bold?: boolean; highlight?: boolean; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-2 border-b border-neutral-800/60 pb-1.5 last:border-0 last:pb-0">
      <span className="shrink-0 text-neutral-500">{label}</span>
      <span className={`text-right ${bold ? "font-semibold text-neutral-50" : ""} ${highlight ? "text-secondary" : "text-neutral-200"} ${mono ? "font-mono text-[10px] break-all" : ""}`}>
        {value}
      </span>
    </div>
  );
}
