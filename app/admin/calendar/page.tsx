import { requireAuth, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
import Link from "next/link";
import { revalidatePath, revalidateTag } from "next/cache";

type PageProps = {
  searchParams: Promise<{ month?: string; year?: string }>;
};

export default async function AdminCalendarPage({ searchParams }: PageProps) {
  await requireAuth();
  const admin = await isAdmin();
  if (!admin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-neutral-400">
        Accès refusé.
      </div>
    );
  }

  const sp = await searchParams;
  const now = new Date();
  const displayYear = sp.year ? parseInt(sp.year) : now.getFullYear();
  // month param is 1-based (janvier = 1)
  const displayMonth = sp.month ? parseInt(sp.month) - 1 : now.getMonth(); // 0-based

  const displayDate = new Date(displayYear, displayMonth, 1);
  const start = startOfMonth(displayDate);
  const end = endOfMonth(displayDate);

  // Navigation prev/next
  const prevDate = new Date(displayYear, displayMonth - 1, 1);
  const nextDate = new Date(displayYear, displayMonth + 1, 1);
  const prevHref = `/admin/calendar?year=${prevDate.getFullYear()}&month=${prevDate.getMonth() + 1}`;
  const nextHref = `/admin/calendar?year=${nextDate.getFullYear()}&month=${nextDate.getMonth() + 1}`;
  const isCurrentMonth =
    displayYear === now.getFullYear() && displayMonth === now.getMonth();

  const [reservations, blocked] = await Promise.all([
    prisma.reservation.findMany({
      where: {
        status: { notIn: ["CANCELLED"] },
        OR: [
          { checkIn: { lte: end }, checkOut: { gte: start } },
        ],
      },
      select: { checkIn: true, checkOut: true, confirmationCode: true, guestName: true },
    }),
    prisma.blockedDate.findMany({
      where: {
        OR: [
          { startDate: { lte: end }, endDate: { gte: start } },
        ],
      },
      select: { id: true, startDate: true, endDate: true, reason: true, notes: true },
      orderBy: { startDate: "asc" },
    }),
  ]);

  const days = eachDayOfInterval({ start, end });

  // Calcul du décalage de début (lundi = 0, ..., dimanche = 6)
  const firstDayOffset = (getDay(start) + 6) % 7;

  const getStatus = (date: Date) => {
    const iso = date.toISOString().split("T")[0];
    const reservation = reservations.find(
      (r) =>
        iso >= r.checkIn.toISOString().split("T")[0] &&
        iso < r.checkOut.toISOString().split("T")[0],
    );
    if (reservation) return { type: "reserved" as const, label: reservation.guestName };
    const blockedDay = blocked.find(
      (b) =>
        iso >= b.startDate.toISOString().split("T")[0] &&
        iso <= b.endDate.toISOString().split("T")[0],
    );
    if (blockedDay) return { type: "blocked" as const, label: blockedDay.reason };
    return { type: "available" as const, label: null };
  };

  // Liste des blocages futurs ou en cours
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const allBlocked = await prisma.blockedDate.findMany({
    where: { endDate: { gte: today } },
    orderBy: { startDate: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-neutral-50">Calendrier</h1>
        <p className="mt-1 text-[11px] text-neutral-400">
          Visualisez et gérez les disponibilités de la villa.
        </p>
      </div>

      <div className="grid gap-4 rounded-2xl border border-neutral-800 bg-[#050505] p-4 text-[11px] text-neutral-200 md:grid-cols-[2fr,1.1fr]">
        {/* Calendrier */}
        <div>
          {/* Navigation mois */}
          <div className="mb-3 flex items-center justify-between">
            <Link
              href={prevHref}
              className="rounded-full border border-neutral-700 px-3 py-1 text-[11px] text-neutral-400 hover:border-neutral-500 hover:text-neutral-200 transition"
            >
              ← Précédent
            </Link>
            <div className="text-center">
              <p className="text-xs font-semibold text-neutral-100 capitalize">
                {displayDate.toLocaleDateString("fr-FR", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
              {!isCurrentMonth && (
                <Link
                  href="/admin/calendar"
                  className="text-[10px] text-primary hover:underline"
                >
                  Revenir au mois actuel
                </Link>
              )}
            </div>
            <Link
              href={nextHref}
              className="rounded-full border border-neutral-700 px-3 py-1 text-[11px] text-neutral-400 hover:border-neutral-500 hover:text-neutral-200 transition"
            >
              Suivant →
            </Link>
          </div>

          {/* Grille */}
          <div className="grid grid-cols-7 gap-1 text-[10px] text-neutral-400">
            {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
              <div key={i} className="py-1 text-center font-semibold">
                {d}
              </div>
            ))}

            {/* Cellules vides pour l'alignement */}
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {days.map((day) => {
              const status = getStatus(day);
              const isToday =
                day.toISOString().split("T")[0] ===
                now.toISOString().split("T")[0];

              const classes =
                status.type === "reserved"
                  ? "bg-amber-500/30 border-amber-500 text-amber-200"
                  : status.type === "blocked"
                  ? "bg-rose-500/30 border-rose-500 text-rose-200"
                  : "bg-primary/20 border-primary/60 text-primary";

              return (
                <div
                  key={day.toISOString()}
                  title={status.label ?? undefined}
                  className={`flex h-8 items-center justify-center rounded-md border text-[11px] relative ${classes} ${isToday ? "ring-2 ring-white/40" : ""}`}
                >
                  {day.getDate()}
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex gap-4 text-[10px] text-neutral-400">
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-sm bg-primary/60" /> Disponible
            </div>
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-sm bg-amber-500/70" /> Réservé
            </div>
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-sm bg-rose-500/70" /> Bloqué
            </div>
          </div>
        </div>

        {/* Formulaire blocage */}
        <form
          className="space-y-3 rounded-xl border border-neutral-800 bg-[#020617] p-4"
          action={createBlock}
          onSubmit="const s=this.startDate.value,e=this.endDate.value;if(s&&e&&s>e){event.preventDefault();this.querySelector('[data-error]').classList.remove('hidden');return false}this.querySelector('[data-error]').classList.add('hidden')"
        >
          <p className="text-xs font-semibold text-neutral-100">
            Ajouter un blocage
          </p>
          <p data-error className="hidden rounded-lg border border-cta/40 bg-cta/10 px-3 py-2 text-[11px] font-semibold text-cta">
            La date de d\u00e9but doit \u00eatre ant\u00e9rieure ou \u00e9gale \u00e0 la date de fin.
          </p>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-neutral-400">Du</label>
            <input
              type="date"
              name="startDate"
              className="rounded-lg border border-neutral-700 bg-black px-2 py-1.5 text-[11px] text-neutral-100 outline-none focus:border-primary"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-neutral-400">Au</label>
            <input
              type="date"
              name="endDate"
              className="rounded-lg border border-neutral-700 bg-black px-2 py-1.5 text-[11px] text-neutral-100 outline-none focus:border-primary"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-neutral-400">Raison</label>
            <select
              name="reason"
              className="rounded-lg border border-neutral-700 bg-black px-2 py-1.5 text-[11px] text-neutral-100 outline-none focus:border-primary"
              defaultValue="OWNER"
            >
              <option value="OWNER">Propriétaire</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="RESERVATION">Réservation externe</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-neutral-400">Notes</label>
            <textarea
              name="notes"
              rows={3}
              className="rounded-lg border border-neutral-700 bg-black px-2 py-1.5 text-[11px] text-neutral-100 outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="mt-1 inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2 text-[11px] font-semibold text-white shadow-md hover:opacity-90"
          >
            Bloquer ces dates
          </button>
        </form>
      </div>

      {/* Liste des blocages à venir */}
      {allBlocked.length > 0 && (
        <div className="rounded-2xl border border-neutral-800 bg-[#050505] p-4">
          <p className="mb-3 text-xs font-semibold text-neutral-100">
            Blocages actifs et à venir
          </p>
          <div className="space-y-2">
            {allBlocked.map((b) => {
              const isInverted = b.startDate > b.endDate;
              return (
              <div
                key={b.id}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 ${isInverted ? "border-cta/50 bg-cta/10" : "border-neutral-800 bg-[#0c0c0c]"}`}
              >
                <div className="space-y-0.5">
                  <p className={`text-[11px] font-semibold ${isInverted ? "text-cta" : "text-neutral-200"}`}>
                    {b.startDate.toLocaleDateString("fr-FR")} →{" "}
                    {b.endDate.toLocaleDateString("fr-FR")}
                    {isInverted && " ⚠ Dates inversées"}
                  </p>
                  <p className="text-[10px] text-neutral-500">
                    {b.reason}
                    {b.notes ? ` — ${b.notes}` : ""}
                  </p>
                </div>
                <form action={deleteBlock}>
                  <input type="hidden" name="id" value={b.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-neutral-700 px-2.5 py-1 text-[10px] text-neutral-500 hover:border-cta hover:text-cta transition"
                  >
                    Supprimer
                  </button>
                </form>
              </div>
            );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

async function createBlock(formData: FormData) {
  "use server";

  const start = formData.get("startDate") as string;
  const end = formData.get("endDate") as string;
  const reason = ((formData.get("reason") as string) || "OWNER") as import("@prisma/client").BlockedReason;
  const notes = (formData.get("notes") as string) || undefined;

  if (!start || !end) return;

  // Validation : la date de début doit être avant ou égale à la date de fin
  if (start > end) return;

  await prisma.blockedDate.create({
    data: {
      villaId: 1,
      startDate: new Date(start),
      endDate: new Date(end),
      reason,
      notes,
    },
  });

  revalidateTag("availability");
  revalidatePath("/admin/calendar");
}

async function deleteBlock(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  if (!id) return;
  await prisma.blockedDate.delete({ where: { id } });
  revalidateTag("availability");
  revalidatePath("/admin/calendar");
}
