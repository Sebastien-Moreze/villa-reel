import { prisma } from "@/lib/prisma";
import { requireAuth, isAdmin } from "@/lib/auth";
import { PromoCodeType } from "@prisma/client";
import { revalidatePath } from "next/cache";

export default async function AdminPromotionsPage() {
  await requireAuth();
  const admin = await isAdmin();
  if (!admin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-neutral-400">
        Accès refusé.
      </div>
    );
  }

  const promos = await prisma.promoCode.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { reservations: true } } },
  });

  const now = new Date();

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6">
      <h1 className="text-lg font-semibold text-neutral-50">Codes promotionnels</h1>
      <p className="mt-1 text-[11px] text-neutral-400">
        Créez et gérez les codes promo appliqués lors de la réservation.
      </p>

      {/* Formulaire création */}
      <div className="mt-5 rounded-2xl border border-neutral-800 bg-[#0c0c0c] p-5">
        <p className="mb-4 text-xs font-semibold text-neutral-100">
          Nouveau code promo
        </p>
        <form action={createPromo} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-neutral-400">Code *</label>
            <input
              name="code"
              required
              placeholder="EX: NOEL2026"
              className="rounded-xl border border-neutral-700 bg-[#050505] px-3 py-2 text-[11px] text-neutral-100 outline-none focus:border-primary uppercase"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-neutral-400">Type *</label>
            <select
              name="type"
              required
              className="rounded-xl border border-neutral-700 bg-[#050505] px-3 py-2 text-[11px] text-neutral-100 outline-none focus:border-primary"
            >
              <option value="PERCENT">Pourcentage (%)</option>
              <option value="FIXED">Montant fixe (€)</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-neutral-400">Valeur *</label>
            <input
              name="value"
              type="number"
              required
              min="0"
              step="0.01"
              placeholder="10"
              className="rounded-xl border border-neutral-700 bg-[#050505] px-3 py-2 text-[11px] text-neutral-100 outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-neutral-400">Date début</label>
            <input
              name="startDate"
              type="date"
              className="rounded-xl border border-neutral-700 bg-[#050505] px-3 py-2 text-[11px] text-neutral-100 outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-neutral-400">Date fin</label>
            <input
              name="endDate"
              type="date"
              className="rounded-xl border border-neutral-700 bg-[#050505] px-3 py-2 text-[11px] text-neutral-100 outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-neutral-400">Max utilisations</label>
            <input
              name="maxUses"
              type="number"
              min="1"
              placeholder="Illimité"
              className="rounded-xl border border-neutral-700 bg-[#050505] px-3 py-2 text-[11px] text-neutral-100 outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-neutral-400">Séjour min (nuits)</label>
            <input
              name="minNights"
              type="number"
              min="1"
              placeholder="Aucun minimum"
              className="rounded-xl border border-neutral-700 bg-[#050505] px-3 py-2 text-[11px] text-neutral-100 outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-[10px] text-neutral-400">Description (facultatif)</label>
            <input
              name="description"
              placeholder="Ex: Offre Noël 2026"
              className="rounded-xl border border-neutral-700 bg-[#050505] px-3 py-2 text-[11px] text-neutral-100 outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-end sm:col-span-3">
            <button
              type="submit"
              className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-white hover:opacity-90"
            >
              Créer le code
            </button>
          </div>
        </form>
      </div>

      {/* Liste */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-800 bg-[#050505]">
        <table className="w-full border-collapse text-[11px] text-neutral-200">
          <thead className="bg-neutral-900/80 text-neutral-400">
            <tr>
              <th className="px-3 py-2 text-left">Code</th>
              <th className="px-3 py-2 text-left">Remise</th>
              <th className="px-3 py-2 text-left">Validité</th>
              <th className="px-3 py-2 text-left">Utilisations</th>
              <th className="px-3 py-2 text-left">Statut</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {promos.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-neutral-500">
                  Aucun code promo créé.
                </td>
              </tr>
            )}
            {promos.map((p) => {
              const expired = p.endDate ? p.endDate < now : false;
              const notStarted = p.startDate ? p.startDate > now : false;

              return (
                <tr key={p.id} className="border-t border-neutral-800/80 hover:bg-neutral-900/40">
                  <td className="px-3 py-2">
                    <span className="font-mono font-semibold text-neutral-100 tracking-wide">
                      {p.code}
                    </span>
                    {p.description && (
                      <p className="text-[10px] text-neutral-500">{p.description}</p>
                    )}
                  </td>
                  <td className="px-3 py-2 font-semibold text-secondary">
                    {p.type === "PERCENT"
                      ? `−${p.value}%`
                      : `−${Number(p.value).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}`}
                    {p.minNights && (
                      <p className="text-[10px] text-neutral-500">Min {p.minNights} nuits</p>
                    )}
                  </td>
                  <td className="px-3 py-2 text-neutral-300">
                    {p.startDate
                      ? p.startDate.toLocaleDateString("fr-FR")
                      : "—"}
                    {" → "}
                    {p.endDate
                      ? p.endDate.toLocaleDateString("fr-FR")
                      : "Sans limite"}
                  </td>
                  <td className="px-3 py-2 text-neutral-300">
                    {p.usedCount}
                    {p.maxUses != null && ` / ${p.maxUses}`}
                  </td>
                  <td className="px-3 py-2">
                    {expired ? (
                      <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-500">
                        Expiré
                      </span>
                    ) : notStarted ? (
                      <span className="rounded-full bg-yellow-400/10 px-2 py-0.5 text-[10px] text-yellow-400">
                        Programmé
                      </span>
                    ) : p.isActive ? (
                      <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] text-primary">
                        Actif
                      </span>
                    ) : (
                      <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-500">
                        Inactif
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      <form action={togglePromo}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="current" value={String(p.isActive)} />
                        <button className="rounded-full border border-neutral-700 px-2 py-0.5 text-[10px] text-neutral-300 hover:border-primary">
                          {p.isActive ? "Désactiver" : "Activer"}
                        </button>
                      </form>
                      <form action={deletePromo}>
                        <input type="hidden" name="id" value={p.id} />
                        <button className="rounded-full border border-neutral-700 px-2 py-0.5 text-[10px] text-neutral-400 hover:border-cta hover:text-cta">
                          Supprimer
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Server Actions ────────────────────────────────────────────────────────────

async function createPromo(formData: FormData) {
  "use server";
  const code = (formData.get("code") as string).toUpperCase().trim();
  const type = formData.get("type") as PromoCodeType;
  const value = parseFloat(formData.get("value") as string);
  const startDate = formData.get("startDate") as string | null;
  const endDate = formData.get("endDate") as string | null;
  const maxUses = formData.get("maxUses") ? Number(formData.get("maxUses")) : null;
  const minNights = formData.get("minNights") ? Number(formData.get("minNights")) : null;
  const description = (formData.get("description") as string) || null;

  await prisma.promoCode.create({
    data: {
      code,
      type,
      value,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      maxUses,
      minNights,
      description,
    },
  });
  revalidatePath("/admin/promotions");
}

async function togglePromo(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  const current = formData.get("current") === "true";
  await prisma.promoCode.update({
    where: { id },
    data: { isActive: !current },
  });
  revalidatePath("/admin/promotions");
}

async function deletePromo(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  await prisma.promoCode.delete({ where: { id } });
  revalidatePath("/admin/promotions");
}
