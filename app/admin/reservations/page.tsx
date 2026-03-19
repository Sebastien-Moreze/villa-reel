import { prisma } from "@/lib/prisma";
import { requireAuth, isAdmin } from "@/lib/auth";
import { ReservationStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

type PageProps = {
  searchParams: Promise<{
    page?: string;
    status?: ReservationStatus | "ALL";
    q?: string;
  }>;
};

const PAGE_SIZE = 20;

export default async function AdminReservationsPage({
  searchParams,
}: PageProps) {
  await requireAuth();
  const admin = await isAdmin();
  if (!admin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-neutral-400">
        Accès refusé.
      </div>
    );
  }

  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;
  const status = params.status && params.status !== "ALL"
    ? params.status
    : undefined;
  const q = params.q?.trim();

  const where = {
    ...(status && { status }),
    ...(q && {
      OR: [
        { guestName: { contains: q, mode: "insensitive" as const } },
        { guestEmail: { contains: q, mode: "insensitive" as const } },
        { confirmationCode: { contains: q, mode: "insensitive" as const } },
      ],
    }),
  };

  const [totalCount, reservations] = await Promise.all([
    prisma.reservation.count({ where }),
    prisma.reservation.findMany({
      where,
      orderBy: { checkIn: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { villa: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      <h1 className="text-lg font-semibold text-neutral-50">Réservations</h1>
      <p className="mt-1 text-[11px] text-neutral-400">
        Recherchez, filtrez et exportez les réservations de la villa.
      </p>

      <form className="mt-4 flex flex-wrap items-center gap-3 text-[11px]">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Rechercher par nom, email ou code..."
          className="w-full max-w-xs rounded-full border border-neutral-700 bg-[#050505] px-3 py-1.5 text-xs text-neutral-100 outline-none focus:border-primary"
        />
        <select
          name="status"
          defaultValue={params.status ?? "ALL"}
          className="rounded-full border border-neutral-700 bg-[#050505] px-3 py-1.5 text-xs text-neutral-100 outline-none focus:border-primary"
        >
          <option value="ALL">Tous les statuts</option>
          <option value="PENDING">En attente</option>
          <option value="CONFIRMED">Confirmée</option>
          <option value="CANCELLED">Annulée</option>
          <option value="COMPLETED">Terminée</option>
        </select>
        <button className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white">
          Filtrer
        </button>
      </form>

      <div className="mt-3">
        <a
          href={`/api/admin/reservations/export?status=${params.status ?? ""}&q=${q ?? ""}`}
          className="inline-block rounded-full border border-neutral-700 px-3 py-1.5 text-[11px] text-neutral-200 hover:border-primary"
        >
          ↓ Exporter en CSV
        </a>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-800 bg-[#050505]">
        <table className="w-full border-collapse text-[11px] text-neutral-200">
          <thead className="bg-neutral-900/80 text-neutral-400">
            <tr>
              <th className="px-3 py-2 text-left">Code</th>
              <th className="px-3 py-2 text-left">Voyageur</th>
              <th className="px-3 py-2 text-left">Villa</th>
              <th className="px-3 py-2 text-left">Séjour</th>
              <th className="px-3 py-2 text-left">Montant</th>
              <th className="px-3 py-2 text-left">Statut</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-4 text-center text-neutral-500"
                >
                  Aucune réservation trouvée.
                </td>
              </tr>
            )}
            {reservations.map((r) => (
              <tr
                key={r.id}
                className="border-t border-neutral-800/80 hover:bg-neutral-900/40"
              >
                <td className="px-3 py-2 font-mono text-[10px] text-neutral-300">
                  {r.confirmationCode}
                </td>
                <td className="px-3 py-2">
                  <div className="font-semibold text-neutral-100">
                    {r.guestName}
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    {r.guestEmail}
                  </div>
                </td>
                <td className="px-3 py-2 text-neutral-200">
                  {r.villa.nameFr}
                </td>
                <td className="px-3 py-2 text-neutral-200">
                  {r.checkIn.toLocaleDateString("fr-FR")} →{" "}
                  {r.checkOut.toLocaleDateString("fr-FR")}
                </td>
                <td className="px-3 py-2 text-neutral-200">
                  {Number(r.totalAmount).toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </td>
                <td className="px-3 py-2">
                  <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-neutral-300">
                    {r.status}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    <a
                      href={`/admin/reservations/${r.id}`}
                      className="rounded-full border border-neutral-700 px-2 py-0.5 text-[10px] text-neutral-200 hover:border-primary"
                    >
                      Détail
                    </a>
                    {r.status === "PENDING" && (
                      <form action={confirmReservation}>
                        <input type="hidden" name="id" value={r.id} />
                        <button className="rounded-full border border-neutral-700 px-2 py-0.5 text-[10px] text-neutral-200 hover:border-primary hover:text-primary">
                          Confirmer
                        </button>
                      </form>
                    )}
                    {(r.status === "PENDING" || r.status === "CONFIRMED") && (
                      <form action={cancelReservation}>
                        <input type="hidden" name="id" value={r.id} />
                        <button className="rounded-full border border-neutral-700 px-2 py-0.5 text-[10px] text-neutral-200 hover:border-cta hover:text-cta">
                          Annuler
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-[11px] text-neutral-400">
        <span>
          Page {page} / {totalPages} — {totalCount} réservation(s)
        </span>
        <div className="flex gap-2">
          {page > 1 && (
            <a
              href={`?page=${page - 1}&status=${params.status ?? ""}&q=${q ?? ""}`}
              className="rounded-full border border-neutral-700 px-3 py-1 text-[11px] text-neutral-200 hover:border-primary"
            >
              Précédent
            </a>
          )}
          {page < totalPages && (
            <a
              href={`?page=${page + 1}&status=${params.status ?? ""}&q=${q ?? ""}`}
              className="rounded-full border border-neutral-700 px-3 py-1 text-[11px] text-neutral-200 hover:border-primary"
            >
              Suivant
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

async function confirmReservation(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  await prisma.reservation.update({
    where: { id },
    data: { status: "CONFIRMED" },
  });
  revalidatePath("/admin/reservations");
}

async function cancelReservation(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  await prisma.reservation.update({
    where: { id },
    data: {
      status: "CANCELLED",
      cancellationReason: "Annulée depuis le backoffice admin",
      cancelledAt: new Date(),
    },
  });
  revalidatePath("/admin/reservations");
}

