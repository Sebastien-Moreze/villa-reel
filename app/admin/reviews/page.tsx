import { prisma } from "@/lib/prisma";
import { requireAuth, isAdmin } from "@/lib/auth";
import { ReviewStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

type PageProps = {
  searchParams: { status?: ReviewStatus | "ALL" };
};

export default async function AdminReviewsPage({ searchParams }: PageProps) {
  await requireAuth();
  const admin = await isAdmin();
  if (!admin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-neutral-400">
        Accès refusé.
      </div>
    );
  }

  const filter = searchParams.status && searchParams.status !== "ALL"
    ? searchParams.status
    : undefined;

  const reviews = await prisma.review.findMany({
    where: filter ? { status: filter } : {},
    orderBy: { createdAt: "desc" },
    include: { reservation: { select: { confirmationCode: true, checkIn: true, checkOut: true } } },
  });

  const counts = await prisma.review.groupBy({
    by: ["status"],
    _count: true,
  });
  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count]));

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6">
      <h1 className="text-lg font-semibold text-neutral-50">Avis clients</h1>
      <p className="mt-1 text-[11px] text-neutral-400">
        Modérez les avis avant publication sur le site.
      </p>

      {/* KPIs */}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <KpiCard label="En attente" value={countMap["PENDING"] ?? 0} highlight />
        <KpiCard label="Publiés" value={countMap["APPROVED"] ?? 0} />
        <KpiCard label="Rejetés" value={countMap["REJECTED"] ?? 0} />
      </div>

      {/* Filtres */}
      <div className="mt-5 flex flex-wrap gap-2 text-[11px]">
        {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
          <a
            key={s}
            href={`?status=${s}`}
            className={`rounded-full border px-3 py-1 transition ${
              (searchParams.status ?? "ALL") === s
                ? "border-primary bg-primary/20 text-primary"
                : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
            }`}
          >
            {s === "ALL" ? "Tous" : s === "PENDING" ? "En attente" : s === "APPROVED" ? "Publiés" : "Rejetés"}
          </a>
        ))}
      </div>

      {/* Liste */}
      <div className="mt-4 space-y-3">
        {reviews.length === 0 && (
          <p className="py-8 text-center text-[11px] text-neutral-500">
            Aucun avis pour ce filtre.
          </p>
        )}
        {reviews.map((review) => (
          <div
            key={review.id}
            className="rounded-2xl border border-neutral-800 bg-[#0c0c0c] p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-neutral-100">
                    {review.guestName}
                  </p>
                  <StatusBadge status={review.status} />
                </div>
                <p className="mt-0.5 text-[10px] text-neutral-500">
                  Résa {review.reservation.confirmationCode} —{" "}
                  {review.reservation.checkIn.toLocaleDateString("fr-FR")} →{" "}
                  {review.reservation.checkOut.toLocaleDateString("fr-FR")}
                </p>
                <div className="mt-1 flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={i < review.rating ? "text-yellow-400" : "text-neutral-700"}
                    >
                      ★
                    </span>
                  ))}
                  <span className="ml-1 text-[10px] text-neutral-500">
                    ({review.rating}/5)
                  </span>
                </div>
                {/* Note détaillée */}
                <div className="mt-1.5 flex flex-wrap gap-x-3 text-[10px] text-neutral-500">
                  <span>Propreté {review.ratingCleanliness}/5</span>
                  <span>Confort {review.ratingComfort}/5</span>
                  <span>Localisation {review.ratingLocation}/5</span>
                  <span>Communication {review.ratingCommunication}/5</span>
                </div>
              </div>

              {review.status === "PENDING" && (
                <div className="flex gap-2">
                  <form action={approveReview}>
                    <input type="hidden" name="id" value={review.id} />
                    <button className="rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-white hover:opacity-90">
                      Approuver
                    </button>
                  </form>
                  <form action={rejectReview}>
                    <input type="hidden" name="id" value={review.id} />
                    <button className="rounded-full border border-cta px-3 py-1 text-[11px] text-cta hover:bg-cta/10">
                      Rejeter
                    </button>
                  </form>
                </div>
              )}
              {review.status === "APPROVED" && (
                <form action={rejectReview}>
                  <input type="hidden" name="id" value={review.id} />
                  <button className="rounded-full border border-neutral-700 px-3 py-1 text-[11px] text-neutral-400 hover:border-cta hover:text-cta">
                    Dépublier
                  </button>
                </form>
              )}
              {review.status === "REJECTED" && (
                <form action={approveReview}>
                  <input type="hidden" name="id" value={review.id} />
                  <button className="rounded-full border border-neutral-700 px-3 py-1 text-[11px] text-neutral-400 hover:border-primary hover:text-primary">
                    Réapprouver
                  </button>
                </form>
              )}
            </div>

            {review.comment && (
              <p className="mt-3 border-t border-neutral-800 pt-3 text-[11px] leading-relaxed text-neutral-300">
                &ldquo;{review.comment}&rdquo;
              </p>
            )}

            <p className="mt-2 text-[10px] text-neutral-600">
              Soumis le {review.createdAt.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              {review.approvedAt && ` — Approuvé le ${review.approvedAt.toLocaleDateString("fr-FR")}`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Server Actions ───────────────────────────────────────────────────────────

async function approveReview(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  await prisma.review.update({
    where: { id },
    data: { status: "APPROVED", approvedAt: new Date() },
  });
  revalidatePath("/admin/reviews");
}

async function rejectReview(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  await prisma.review.update({
    where: { id },
    data: { status: "REJECTED", approvedAt: null },
  });
  revalidatePath("/admin/reviews");
}

// ── Composants ──────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-[#0c0c0c] p-4">
      <p className="text-[11px] text-neutral-400">{label}</p>
      <p
        className={`mt-2 text-2xl font-semibold ${
          highlight && value > 0 ? "text-yellow-400" : "text-neutral-50"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: ReviewStatus }) {
  const map: Record<ReviewStatus, { label: string; cls: string }> = {
    PENDING:  { label: "En attente", cls: "bg-yellow-400/10 text-yellow-400" },
    APPROVED: { label: "Publié",     cls: "bg-primary/20  text-primary"      },
    REJECTED: { label: "Rejeté",     cls: "bg-cta/10      text-cta"          },
  };
  const { label, cls } = map[status];
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}>
      {label}
    </span>
  );
}
