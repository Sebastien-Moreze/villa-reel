import { requireAuth, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardChart } from "@/components/admin/DashboardChart";

export default async function AdminDashboardPage() {
  await requireAuth();
  const admin = await isAdmin();
  if (!admin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-neutral-400">
        Accès refusé.
      </div>
    );
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59);

  const [reservationsThisMonth, revenueAgg, occupancySource, pendingReviews] =
    await Promise.all([
      prisma.reservation.count({
        where: {
          checkIn: { gte: startOfMonth, lte: endOfMonth },
        },
      }),
      prisma.reservation.aggregate({
        _sum: { totalAmount: true },
      }),
      prisma.reservation.findMany({
        where: {
          checkIn: { gte: startOfMonth, lte: endOfMonth },
          status: { in: ["CONFIRMED", "COMPLETED"] },
        },
        select: { checkIn: true, checkOut: true },
      }),
      prisma.review.count({
        where: { status: "PENDING" },
      }),
    ]);

  const totalRevenue = Number(revenueAgg._sum.totalAmount ?? 0);

  const totalNightsInMonth = (endOfMonth.getDate() - startOfMonth.getDate() + 1) * 1; // villa unique
  const occupiedNights = occupancySource.reduce((acc, r) => {
    const start = r.checkIn < startOfMonth ? startOfMonth : r.checkIn;
    const end = r.checkOut > endOfMonth ? endOfMonth : r.checkOut;
    const diff = Math.max(
      0,
      Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
    );
    return acc + diff;
  }, 0);
  const occupancyRate =
    totalNightsInMonth > 0
      ? Math.round((occupiedNights / totalNightsInMonth) * 100)
      : 0;

  const upcomingReservations = await prisma.reservation.findMany({
    where: {
      checkIn: { gte: now },
    },
    orderBy: { checkIn: "asc" },
    take: 5,
    include: { villa: true },
  });

  const alerts: string[] = [];
  const awaitingPayments = await prisma.reservation.count({
    where: { paymentStatus: "AWAITING" },
  });
  if (awaitingPayments > 0) {
    alerts.push(`${awaitingPayments} paiements en attente`);
  }
  if (pendingReviews > 0) {
    alerts.push(`${pendingReviews} avis à modérer`);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      <h1 className="text-lg font-semibold text-neutral-50">
        Tableau de bord
      </h1>
      <p className="mt-1 text-[11px] text-neutral-400">
        Vue d&apos;ensemble des performances de la Villa R.E.E.L.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <KpiCard label="Réservations ce mois" value={reservationsThisMonth} />
        <KpiCard
          label="Chiffre d'affaires total"
          value={totalRevenue.toLocaleString("fr-FR", {
            style: "currency",
            currency: "EUR",
          })}
        />
        <KpiCard label="Taux d'occupation" value={`${occupancyRate}%`} />
        <KpiCard label="Avis en attente" value={pendingReviews} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-[2fr,1.2fr]">
        <div className="rounded-2xl border border-neutral-800 bg-[#0c0c0c] p-4">
          <p className="text-xs font-semibold text-neutral-100">
            Chiffre d&apos;affaires mensuel
          </p>
          <p className="mb-3 text-[11px] text-neutral-500">
            Vue synthétique sur les 12 derniers mois.
          </p>
          <DashboardChart />
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-neutral-800 bg-[#0c0c0c] p-4">
            <p className="text-xs font-semibold text-neutral-100">
              Prochaines réservations
            </p>
            <ul className="mt-3 space-y-2 text-[11px] text-neutral-300">
              {upcomingReservations.length === 0 && (
                <li className="text-neutral-500">
                  Aucune réservation à venir pour le moment.
                </li>
              )}
              {upcomingReservations.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between rounded-xl bg-neutral-900/60 px-3 py-2"
                >
                  <div>
                    <p className="font-semibold text-neutral-100">
                      {r.guestName}
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      {r.villa.nameFr} —{" "}
                      {r.checkIn.toLocaleDateString("fr-FR")} →{" "}
                      {r.checkOut.toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary/40 px-2 py-0.5 text-[10px] text-primary">
                    {r.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-[#0c0c0c] p-4">
            <p className="text-xs font-semibold text-neutral-100">
              Alertes
            </p>
            <ul className="mt-3 space-y-1 text-[11px] text-neutral-300">
              {alerts.length === 0 && (
                <li className="text-neutral-500">
                  Aucune alerte importante pour le moment.
                </li>
              )}
              {alerts.map((a) => (
                <li key={a}>• {a}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

type KpiProps = { label: string; value: number | string };

function KpiCard({ label, value }: KpiProps) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-[#0c0c0c] p-4 text-xs text-neutral-200">
      <p className="text-[11px] text-neutral-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-neutral-50">{value}</p>
    </div>
  );
}


