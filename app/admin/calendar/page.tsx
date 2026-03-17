import { requireAuth, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

export default async function AdminCalendarPage() {
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
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  const [reservations, blocked] = await Promise.all([
    prisma.reservation.findMany({
      where: {
        OR: [
          { checkIn: { gte: start, lte: end } },
          { checkOut: { gte: start, lte: end } },
        ],
      },
      select: { checkIn: true, checkOut: true },
    }),
    prisma.blockedDate.findMany({
      where: {
        OR: [
          { startDate: { gte: start, lte: end } },
          { endDate: { gte: start, lte: end } },
        ],
      },
      select: { startDate: true, endDate: true },
    }),
  ]);

  const days = eachDayOfInterval({ start, end });

  const getStatus = (date: Date) => {
    const iso = date.toISOString().split("T")[0];
    const reserved = reservations.some(
      (r) =>
        iso >= r.checkIn.toISOString().split("T")[0] &&
        iso < r.checkOut.toISOString().split("T")[0],
    );
    if (reserved) return "reserved";
    const blockedDay = blocked.some(
      (b) =>
        iso >= b.startDate.toISOString().split("T")[0] &&
        iso <= b.endDate.toISOString().split("T")[0],
    );
    if (blockedDay) return "blocked";
    return "available";
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      <h1 className="text-lg font-semibold text-neutral-50">Calendrier</h1>
      <p className="mt-1 text-[11px] text-neutral-400">
        Vue mensuelle des réservations et blocages. Pour l&apos;instant, le
        blocage se fait par formulaire.
      </p>

      <div className="mt-5 grid gap-3 rounded-2xl border border-neutral-800 bg-[#050505] p-4 text-[11px] text-neutral-200 md:grid-cols-[2fr,1.1fr]">
        <div>
          <p className="mb-2 text-xs font-semibold text-neutral-100">
            {now.toLocaleDateString("fr-FR", {
              month: "long",
              year: "numeric",
            })}
          </p>
          <div className="grid grid-cols-7 gap-1 text-[10px] text-neutral-400">
            {["L", "M", "M", "J", "V", "S", "D"].map((d) => (
              <div key={d} className="py-1 text-center font-semibold">
                {d}
              </div>
            ))}
            {days.map((day) => {
              const status = getStatus(day);
              const classes =
                status === "reserved"
                  ? "bg-amber-500/30 border-amber-500 text-amber-200"
                  : status === "blocked"
                  ? "bg-rose-500/30 border-rose-500 text-rose-200"
                  : "bg-primary/20 border-primary/60 text-primary";
              return (
                <div
                  key={day.toISOString()}
                  className={`flex h-8 items-center justify-center rounded-md border text-[11px] ${classes}`}
                >
                  {day.getDate()}
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex gap-4 text-[10px] text-neutral-400">
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-sm bg-primary/60" />{" "}
              Disponible
            </div>
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-sm bg-amber-500/70" /> Réservé
            </div>
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-sm bg-rose-500/70" /> Bloqué
            </div>
          </div>
        </div>

        <form
          className="space-y-3 rounded-xl border border-neutral-800 bg-[#020617] p-4"
          action={createBlock}
        >
          <p className="text-xs font-semibold text-neutral-100">
            Ajouter un blocage
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

  await prisma.blockedDate.create({
    data: {
      villaId: 1,
      startDate: new Date(start),
      endDate: new Date(end),
      reason,
      notes,
    },
  });
}

