import { prisma } from "@/lib/prisma";
import { requireAuth, isAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export default async function AdminContentPage() {
  await requireAuth();
  const admin = await isAdmin();
  if (!admin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-neutral-400">
        Accès refusé.
      </div>
    );
  }

  const villa = await prisma.villa.findFirst({
    include: {
      images: { orderBy: { position: "asc" } },
      amenities: { include: { amenity: true } },
    },
  });

  const allAmenities = await prisma.amenity.findMany({ orderBy: { key: "asc" } });

  if (!villa) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-[11px] text-neutral-400">
        Aucune villa trouvée en base.
      </div>
    );
  }

  const linkedAmenityIds = new Set(villa.amenities.map((a) => a.amenityId));

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-6">
      <h1 className="text-lg font-semibold text-neutral-50">Contenu</h1>
      <p className="mt-1 text-[11px] text-neutral-400">
        Modifiez les informations, les tarifs et les équipements de la villa.
      </p>

      {/* ── Infos générales ── */}
      <section className="mt-6">
        <SectionTitle>Informations générales</SectionTitle>
        <form action={updateVillaInfo} className="mt-3 rounded-2xl border border-neutral-800 bg-[#0c0c0c] p-5 space-y-4">
          <input type="hidden" name="id" value={villa.id} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nom (FR)" name="nameFr" defaultValue={villa.nameFr} />
            <Field label="Nom (EN)" name="nameEn" defaultValue={villa.nameEn} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Capacité max (voyageurs)" name="maxGuests" type="number" defaultValue={String(villa.maxGuests)} />
            <Field label="Chambres" name="bedrooms" type="number" defaultValue={String(villa.bedrooms)} />
            <Field label="Salles de bain" name="bathrooms" type="number" defaultValue={String(villa.bathrooms)} />
            <Field label="Surface (m²)" name="surface" type="number" defaultValue={String(villa.surface)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Heure d'arrivée" name="checkInTime" defaultValue={villa.checkInTime} placeholder="15:00" />
            <Field label="Heure de départ" name="checkOutTime" defaultValue={villa.checkOutTime} placeholder="11:00" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-neutral-400">Description (FR)</label>
            <textarea
              name="descriptionFr"
              rows={4}
              defaultValue={villa.descriptionFr}
              className="rounded-xl border border-neutral-700 bg-[#050505] px-3 py-2 text-[11px] text-neutral-100 outline-none focus:border-primary resize-y"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-neutral-400">Description (EN)</label>
            <textarea
              name="descriptionEn"
              rows={4}
              defaultValue={villa.descriptionEn}
              className="rounded-xl border border-neutral-700 bg-[#050505] px-3 py-2 text-[11px] text-neutral-100 outline-none focus:border-primary resize-y"
            />
          </div>
          <SaveBtn />
        </form>
      </section>

      {/* ── Tarifs ── */}
      <section className="mt-8">
        <SectionTitle>Tarifs de base</SectionTitle>
        <form action={updateVillaPrices} className="mt-3 rounded-2xl border border-neutral-800 bg-[#0c0c0c] p-5">
          <input type="hidden" name="id" value={villa.id} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Prix / nuit (€)" name="pricePerNight" type="number" step="0.01" defaultValue={String(villa.pricePerNight)} />
            <Field label="Frais de ménage (€)" name="cleaningFee" type="number" step="0.01" defaultValue={String(villa.cleaningFee)} />
            <Field label="Dépôt de garantie (€)" name="deposit" type="number" step="0.01" defaultValue={String(villa.deposit)} />
            <Field label="Séjour minimum (nuits)" name="minStay" type="number" defaultValue={String(villa.minStay)} />
          </div>
          <div className="mt-4">
            <SaveBtn />
          </div>
        </form>
      </section>

      {/* ── Équipements ── */}
      <section className="mt-8">
        <SectionTitle>Équipements</SectionTitle>
        <form action={updateAmenities} className="mt-3 rounded-2xl border border-neutral-800 bg-[#0c0c0c] p-5">
          <input type="hidden" name="villaId" value={villa.id} />
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {allAmenities.map((amenity) => (
              <label
                key={amenity.id}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-800 p-2 hover:border-neutral-600"
              >
                <input
                  type="checkbox"
                  name="amenities"
                  value={amenity.id}
                  defaultChecked={linkedAmenityIds.has(amenity.id)}
                  className="accent-primary"
                />
                <span className="text-[11px] text-neutral-200">
                  {amenity.icon && <span className="mr-1">{amenity.icon}</span>}
                  {amenity.labelFr}
                </span>
              </label>
            ))}
          </div>
          {allAmenities.length === 0 && (
            <p className="text-[11px] text-neutral-500">
              Aucun équipement défini. Ajoutez-en via la base de données ou le seed.
            </p>
          )}
          <div className="mt-4">
            <SaveBtn />
          </div>
        </form>
      </section>

      {/* ── Photos ── */}
      <section className="mt-8">
        <SectionTitle>Photos ({villa.images.length})</SectionTitle>
        <div className="mt-3 rounded-2xl border border-neutral-800 bg-[#0c0c0c] p-5">
          {villa.images.length === 0 ? (
            <p className="text-[11px] text-neutral-500">Aucune photo enregistrée en base.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {villa.images.map((img) => (
                <div
                  key={img.id}
                  className="group relative overflow-hidden rounded-xl border border-neutral-800"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.altFr ?? ""}
                    className="h-32 w-full object-cover"
                  />
                  <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                    <p className="text-[10px] text-neutral-200 truncate">{img.altFr}</p>
                    <p className="text-[10px] text-neutral-400">Position: {img.position}</p>
                    <form action={deleteImage} className="mt-1">
                      <input type="hidden" name="id" value={img.id} />
                      <input type="hidden" name="villaId" value={villa.id} />
                      <button className="rounded-full bg-cta/80 px-2 py-0.5 text-[10px] text-white hover:bg-cta">
                        Supprimer
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Ajouter une photo */}
          <form action={addImage} className="mt-4 grid gap-3 border-t border-neutral-800 pt-4 sm:grid-cols-2">
            <input type="hidden" name="villaId" value={villa.id} />
            <Field label="URL de l'image *" name="url" placeholder="https://..." />
            <Field label="Texte alternatif (FR)" name="altFr" placeholder="Vue piscine" />
            <Field label="Texte alternatif (EN)" name="altEn" placeholder="Pool view" />
            <Field label="Position (ordre)" name="position" type="number" defaultValue="0" />
            <div className="flex items-end sm:col-span-2">
              <button
                type="submit"
                className="rounded-full bg-primary px-4 py-1.5 text-[11px] font-semibold text-white hover:opacity-90"
              >
                Ajouter la photo
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

// ── Server Actions ────────────────────────────────────────────────────────────

async function updateVillaInfo(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  await prisma.villa.update({
    where: { id },
    data: {
      nameFr: formData.get("nameFr") as string,
      nameEn: formData.get("nameEn") as string,
      descriptionFr: formData.get("descriptionFr") as string,
      descriptionEn: formData.get("descriptionEn") as string,
      maxGuests: Number(formData.get("maxGuests")),
      bedrooms: Number(formData.get("bedrooms")),
      bathrooms: Number(formData.get("bathrooms")),
      surface: Number(formData.get("surface")),
      checkInTime: formData.get("checkInTime") as string,
      checkOutTime: formData.get("checkOutTime") as string,
    },
  });
  revalidatePath("/admin/content");
}

async function updateVillaPrices(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  await prisma.villa.update({
    where: { id },
    data: {
      pricePerNight: parseFloat(formData.get("pricePerNight") as string),
      cleaningFee: parseFloat(formData.get("cleaningFee") as string),
      deposit: parseFloat(formData.get("deposit") as string),
      minStay: Number(formData.get("minStay")),
    },
  });
  revalidatePath("/admin/content");
}

async function updateAmenities(formData: FormData) {
  "use server";
  const villaId = Number(formData.get("villaId"));
  const selectedIds = formData.getAll("amenities").map(Number);

  await prisma.$transaction([
    prisma.villaAmenity.deleteMany({ where: { villaId } }),
    ...selectedIds.map((amenityId) =>
      prisma.villaAmenity.create({ data: { villaId, amenityId } })
    ),
  ]);
  revalidatePath("/admin/content");
}

async function addImage(formData: FormData) {
  "use server";
  const villaId = Number(formData.get("villaId"));
  const url = formData.get("url") as string;
  if (!url) return;
  await prisma.villaImage.create({
    data: {
      villaId,
      url,
      altFr: (formData.get("altFr") as string) || null,
      altEn: (formData.get("altEn") as string) || null,
      position: Number(formData.get("position") ?? 0),
    },
  });
  revalidatePath("/admin/content");
}

async function deleteImage(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  await prisma.villaImage.delete({ where: { id } });
  revalidatePath("/admin/content");
}

// ── Composants ───────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
      {children}
    </h2>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
  step,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  placeholder?: string;
  step?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] text-neutral-400">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        step={step}
        className="rounded-xl border border-neutral-700 bg-[#050505] px-3 py-2 text-[11px] text-neutral-100 outline-none focus:border-primary"
      />
    </div>
  );
}

function SaveBtn() {
  return (
    <button
      type="submit"
      className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-white hover:opacity-90"
    >
      Enregistrer
    </button>
  );
}
