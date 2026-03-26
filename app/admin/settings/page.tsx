import { prisma } from "@/lib/prisma";
import { requireAuth, isAdmin, getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt";
import { PasswordInput } from "@/components/admin/PasswordInput";

export default async function AdminSettingsPage() {
  await requireAuth();
  const admin = await isAdmin();
  if (!admin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-neutral-400">
        Accès refusé.
      </div>
    );
  }

  const user = await getCurrentUser();
  const adminUser = user?.email
    ? await prisma.adminUser.findUnique({ where: { email: user.email } })
    : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-6">
      <h1 className="text-lg font-semibold text-neutral-50">Paramètres</h1>
      <p className="mt-1 text-[11px] text-neutral-400">
        Gérez votre profil administrateur et la configuration du compte.
      </p>

      {/* Profil */}
      <section className="mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Profil administrateur
        </h2>
        <form
          action={updateProfile}
          className="mt-3 rounded-2xl border border-neutral-800 bg-[#0c0c0c] p-5 space-y-4"
        >
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-neutral-400">Nom affiché</label>
            <input
              name="name"
              defaultValue={adminUser?.name ?? ""}
              placeholder="Ex: Rodrigue"
              className="rounded-xl border border-neutral-700 bg-[#050505] px-3 py-2 text-[11px] text-neutral-100 outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-neutral-400">Adresse email</label>
            <input
              name="email"
              type="email"
              defaultValue={adminUser?.email ?? ""}
              className="rounded-xl border border-neutral-700 bg-[#050505] px-3 py-2 text-[11px] text-neutral-100 outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-white hover:opacity-90"
            >
              Enregistrer le profil
            </button>
            <span className="text-[11px] text-neutral-500">
              Rôle :{" "}
              <span className="text-secondary font-semibold">
                {adminUser?.role === "SUPER_ADMIN" ? "Super Admin" : "Manager"}
              </span>
            </span>
          </div>
        </form>
      </section>

      {/* Mot de passe */}
      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Changer le mot de passe
        </h2>
        <form
          action={changePassword}
          className="mt-3 rounded-2xl border border-neutral-800 bg-[#0c0c0c] p-5 space-y-4"
        >
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-neutral-400">Mot de passe actuel *</label>
            <PasswordInput
              name="currentPassword"
              required
              className="rounded-xl border border-neutral-700 bg-[#050505] px-3 py-2 text-[11px] text-neutral-100 outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-neutral-400">Nouveau mot de passe *</label>
            <PasswordInput
              name="newPassword"
              required
              minLength={8}
              className="rounded-xl border border-neutral-700 bg-[#050505] px-3 py-2 text-[11px] text-neutral-100 outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-neutral-400">Confirmer le nouveau mot de passe *</label>
            <PasswordInput
              name="confirmPassword"
              required
              className="rounded-xl border border-neutral-700 bg-[#050505] px-3 py-2 text-[11px] text-neutral-100 outline-none focus:border-primary"
            />
          </div>
          <div>
            <button
              type="submit"
              className="rounded-full bg-secondary px-5 py-2 text-xs font-semibold text-white hover:opacity-90"
            >
              Changer le mot de passe
            </button>
          </div>
        </form>
      </section>

      {/* Infos système */}
      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Informations système
        </h2>
        <div className="mt-3 rounded-2xl border border-neutral-800 bg-[#0c0c0c] p-5 space-y-2 text-[11px]">
          <InfoRow label="Application" value="Villa R.E.E.L — Backoffice" />
          <InfoRow label="Framework" value="Next.js 16 · TypeScript" />
          <InfoRow label="Base de données" value="PostgreSQL · Prisma ORM" />
          <InfoRow label="Paiements" value="Stripe (acompte 30% + solde J-30)" />
          <InfoRow label="Emails" value="Resend · React Email" />
          <InfoRow
            label="Dernière connexion"
            value={
              adminUser?.lastLoginAt
                ? adminUser.lastLoginAt.toLocaleString("fr-FR")
                : "—"
            }
          />
          <InfoRow label="Compte créé le" value={adminUser?.createdAt.toLocaleDateString("fr-FR") ?? "—"} />
        </div>
      </section>

      {/* Zone de danger */}
      <section className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-red-500/70">
          Zone dangereuse
        </h2>
        <div className="mt-3 rounded-2xl border border-red-900/40 bg-[#0c0c0c] p-5">
          <p className="text-[11px] text-neutral-400">
            Ces actions sont irréversibles. Assurez-vous de savoir ce que vous faites.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <form action={purgeOldLogs}>
              <button
                type="submit"
                className="rounded-full border border-neutral-700 px-4 py-1.5 text-[11px] text-neutral-400 hover:border-red-500 hover:text-red-400"
              >
                Purger les logs anciens (&gt; 90j)
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Server Actions ─────────────────────────────────────────────────────────

async function updateProfile(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user?.email) return;

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  await prisma.adminUser.update({
    where: { email: user.email },
    data: { name, email },
  });
  revalidatePath("/admin/settings");
}

async function changePassword(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user?.email) return;

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (newPassword !== confirmPassword) {
    redirect("/admin/settings?error=mismatch");
  }

  const adminUser = await prisma.adminUser.findUnique({ where: { email: user.email } });
  if (!adminUser) return;

  const valid = await bcrypt.compare(currentPassword, adminUser.hashedPassword);
  if (!valid) {
    redirect("/admin/settings?error=invalid");
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.adminUser.update({
    where: { email: user.email },
    data: { hashedPassword: hashed },
  });
  redirect("/admin/settings?success=1");
}

async function purgeOldLogs() {
  "use server";
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  await prisma.contactMessage.deleteMany({
    where: { createdAt: { lt: cutoff }, isRead: true },
  });
  revalidatePath("/admin/settings");
}

// ── Composants ───────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-800 pb-2 last:border-0 last:pb-0">
      <span className="text-neutral-500">{label}</span>
      <span className="text-neutral-300">{value}</span>
    </div>
  );
}
