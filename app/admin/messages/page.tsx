import { prisma } from "@/lib/prisma";
import { requireAuth, isAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type PageProps = {
  searchParams: Promise<{ filter?: "all" | "unread" | "read"; id?: string }>;
};

export default async function AdminMessagesPage({ searchParams }: PageProps) {
  await requireAuth();
  const admin = await isAdmin();
  if (!admin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-neutral-400">
        Accès refusé.
      </div>
    );
  }

  // Next.js 15+ : searchParams est une Promise, il faut l'awaiter
  const { filter: filterParam, id: idParam } = await searchParams;
  const filter = filterParam ?? "all";
  const selectedId = idParam ? Number(idParam) : null;

  const messages = await prisma.contactMessage.findMany({
    where:
      filter === "unread"
        ? { isRead: false }
        : filter === "read"
          ? { isRead: true }
          : {},
    orderBy: { createdAt: "desc" },
  });

  const selected = selectedId
    ? messages.find((m) => m.id === selectedId) ?? null
    : null;

  const unreadCount = await prisma.contactMessage.count({ where: { isRead: false } });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-neutral-50">Messages</h1>
          <p className="mt-1 text-[11px] text-neutral-400">
            Formulaire de contact —{" "}
            {unreadCount > 0 ? (
              <span className="text-yellow-400 font-semibold">{unreadCount} non lu(s)</span>
            ) : (
              "tout lu"
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <form action={markAllRead}>
            <button className="rounded-full border border-neutral-700 px-3 py-1.5 text-[11px] text-neutral-300 hover:border-primary">
              Tout marquer comme lu
            </button>
          </form>
        )}
      </div>

      {/* Filtres */}
      <div className="mt-4 flex gap-2 text-[11px]">
        {(["all", "unread", "read"] as const).map((f) => (
          <a
            key={f}
            href={`?filter=${f}`}
            className={`rounded-full border px-3 py-1 transition ${
              filter === f
                ? "border-primary bg-primary/20 text-primary"
                : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
            }`}
          >
            {f === "all" ? "Tous" : f === "unread" ? "Non lus" : "Lus"}
          </a>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr,1.6fr]">
        {/* Liste */}
        <div className="space-y-2">
          {messages.length === 0 && (
            <p className="py-6 text-center text-[11px] text-neutral-500">
              Aucun message.
            </p>
          )}
          {messages.map((msg) => (
            <a
              key={msg.id}
              href={`?filter=${filter}&id=${msg.id}`}
              className={`block rounded-2xl border p-3 transition ${
                selectedId === msg.id
                  ? "border-primary bg-primary/10"
                  : "border-neutral-800 bg-[#0c0c0c] hover:border-neutral-600"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-neutral-100">
                    {msg.firstName} {msg.lastName}
                    {!msg.isRead && (
                      <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-yellow-400 align-middle" />
                    )}
                  </p>
                  <p className="truncate text-[10px] text-neutral-500">{msg.email}</p>
                  <p className="mt-1 truncate text-[11px] text-neutral-300">{msg.subject}</p>
                </div>
                <span className="shrink-0 text-[10px] text-neutral-600">
                  {msg.createdAt.toLocaleDateString("fr-FR")}
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* Détail */}
        {selected ? (
          <div className="rounded-2xl border border-neutral-800 bg-[#0c0c0c] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-neutral-50">
                  {selected.firstName} {selected.lastName}
                </p>
                <p className="text-[11px] text-neutral-400">{selected.email}</p>
                {selected.phone && (
                  <p className="text-[11px] text-neutral-400">{selected.phone}</p>
                )}
                <p className="mt-0.5 text-[10px] text-neutral-500">
                  {selected.createdAt.toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {" · "}
                  {selected.locale}
                </p>
              </div>
              {!selected.isRead && (
                <form action={markRead}>
                  <input type="hidden" name="id" value={selected.id} />
                  <input type="hidden" name="filter" value={filter} />
                  <button className="rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-white hover:opacity-90">
                    Marquer comme lu
                  </button>
                </form>
              )}
            </div>

            <div className="mt-4 border-t border-neutral-800 pt-4">
              <p className="mb-2 text-[11px] font-semibold text-neutral-300">
                Objet : {selected.subject}
              </p>
              <p className="whitespace-pre-wrap text-[12px] leading-relaxed text-neutral-200">
                {selected.message}
              </p>
            </div>

            <div className="mt-5 border-t border-neutral-800 pt-4">
              <a
                href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                className="inline-block rounded-full bg-secondary/20 px-4 py-1.5 text-[11px] font-semibold text-secondary hover:bg-secondary/30"
              >
                Répondre par email
              </a>
            </div>
          </div>
        ) : (
          <div className="hidden items-center justify-center rounded-2xl border border-neutral-800 bg-[#0c0c0c] p-8 text-[11px] text-neutral-600 lg:flex">
            Sélectionnez un message pour le lire
          </div>
        )}
      </div>
    </div>
  );
}

// ── Server Actions ────────────────────────────────────────────────────────────

async function markRead(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  await prisma.contactMessage.update({ where: { id }, data: { isRead: true } });
  revalidatePath("/admin/messages");
}

async function markAllRead() {
  "use server";
  await prisma.contactMessage.updateMany({
    where: { isRead: false },
    data: { isRead: true },
  });
  revalidatePath("/admin/messages");
}
