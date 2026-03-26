'use client';

import React, { useEffect, useState, useCallback } from "react";
import {
  Wifi, Thermometer, Snowflake, Shirt, Wind, Lock, Flame, Coffee,
  Utensils, UtensilsCrossed, Waves, Mountain, Sun, Sofa, Umbrella,
  Baby, ShowerHead, Bath, Tv, Speaker, Dice5, BookOpen, Target,
  Siren, HeartPulse, Car, PlugZap, Accessibility, Gift, ConciergeBell,
  ChefHat, Grape, CalendarHeart, Sparkles, CircleDot, BedDouble,
  type LucideIcon,
} from "lucide-react";

type Amenity = {
  id: number;
  key: string;
  labelFr: string;
  labelEn: string;
  icon: string | null;
  category: string | null;
};

const CATEGORIES = [
  { value: "essentials", label: "Essentiels" },
  { value: "kitchen", label: "Cuisine" },
  { value: "outdoor", label: "Extérieur & Piscine" },
  { value: "bedroom", label: "Chambres & Confort" },
  { value: "bathroom", label: "Salle de bain" },
  { value: "entertainment", label: "Divertissement" },
  { value: "safety", label: "Sécurité" },
  { value: "parking", label: "Parking & Accès" },
  { value: "services", label: "Services & Extras" },
];

const ICON_OPTIONS: { value: string; label: string; Icon: LucideIcon }[] = [
  { value: "wifi", label: "Wi-Fi", Icon: Wifi },
  { value: "thermometer", label: "Thermomètre", Icon: Thermometer },
  { value: "snowflake", label: "Flocon / Clim", Icon: Snowflake },
  { value: "shirt", label: "Vêtement", Icon: Shirt },
  { value: "wind", label: "Vent / Sèche", Icon: Wind },
  { value: "lock", label: "Cadenas", Icon: Lock },
  { value: "flame", label: "Flamme / Four", Icon: Flame },
  { value: "coffee", label: "Café", Icon: Coffee },
  { value: "utensils", label: "Couverts", Icon: Utensils },
  { value: "utensils-crossed", label: "Couverts croisés", Icon: UtensilsCrossed },
  { value: "waves", label: "Vagues / Piscine", Icon: Waves },
  { value: "mountain", label: "Montagne", Icon: Mountain },
  { value: "sun", label: "Soleil", Icon: Sun },
  { value: "sofa", label: "Canapé", Icon: Sofa },
  { value: "umbrella", label: "Parasol", Icon: Umbrella },
  { value: "baby", label: "Bébé", Icon: Baby },
  { value: "shower-head", label: "Douche", Icon: ShowerHead },
  { value: "bath", label: "Baignoire", Icon: Bath },
  { value: "tv", label: "Télévision", Icon: Tv },
  { value: "speaker", label: "Enceinte", Icon: Speaker },
  { value: "dice-5", label: "Jeux", Icon: Dice5 },
  { value: "book-open", label: "Livre", Icon: BookOpen },
  { value: "target", label: "Cible / Jeux", Icon: Target },
  { value: "siren", label: "Alarme", Icon: Siren },
  { value: "heart-pulse", label: "Santé", Icon: HeartPulse },
  { value: "car", label: "Voiture", Icon: Car },
  { value: "plug-zap", label: "Prise / Recharge", Icon: PlugZap },
  { value: "accessibility", label: "Accessibilité", Icon: Accessibility },
  { value: "gift", label: "Cadeau", Icon: Gift },
  { value: "concierge-bell", label: "Conciergerie", Icon: ConciergeBell },
  { value: "chef-hat", label: "Chef", Icon: ChefHat },
  { value: "grape", label: "Raisin / Vin", Icon: Grape },
  { value: "calendar-heart", label: "Événement", Icon: CalendarHeart },
  { value: "sparkles", label: "Étoiles / Ménage", Icon: Sparkles },
  { value: "circle-dot", label: "Billard", Icon: CircleDot },
  { value: "bed-double", label: "Lit double", Icon: BedDouble },
];

const emptyForm = {
  key: "",
  labelFr: "",
  labelEn: "",
  icon: "",
  category: "essentials",
};

function getIcon(name: string | null): LucideIcon {
  return ICON_OPTIONS.find((i) => i.value === name)?.Icon ?? CircleDot;
}

export default function AdminAmenitiesPage() {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState("");
  const [showIconPicker, setShowIconPicker] = useState(false);

  const fetchAmenities = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/amenities");
    if (res.ok) {
      setAmenities(await res.json());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await fetch("/api/admin/amenities");
      if (!cancelled && res.ok) {
        setAmenities(await res.json());
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const method = editingId ? "PUT" : "POST";
    const body = editingId ? { id: editingId, ...form } : form;

    const res = await fetch("/api/admin/amenities", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erreur lors de la sauvegarde");
      setSaving(false);
      return;
    }

    setForm(emptyForm);
    setEditingId(null);
    setSaving(false);
    setShowIconPicker(false);
    fetchAmenities();
  };

  const handleEdit = (a: Amenity) => {
    setEditingId(a.id);
    setForm({
      key: a.key,
      labelFr: a.labelFr,
      labelEn: a.labelEn,
      icon: a.icon ?? "",
      category: a.category ?? "essentials",
    });
    setError(null);
    setShowIconPicker(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cet équipement ?")) return;

    const res = await fetch(`/api/admin/amenities?id=${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      fetchAmenities();
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setShowIconPicker(false);
  };

  const selectedIconElement = React.createElement(getIcon(form.icon), { className: "h-3.5 w-3.5" });

  const filtered = filterCat
    ? amenities.filter((a) => a.category === filterCat)
    : amenities;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">
          Équipements & Aménagements
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Gérez les équipements de la villa ({amenities.length} au total).
        </p>
      </div>

      {/* ── Form ─────────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
      >
        <h2 className="mb-4 text-sm font-semibold text-neutral-800">
          {editingId ? "Modifier l'équipement" : "Ajouter un équipement"}
        </h2>

        {error && (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
            {error}
          </p>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-neutral-500">
              Clé unique
            </label>
            <input
              type="text"
              value={form.key}
              onChange={(e) => setForm({ ...form, key: e.target.value })}
              placeholder="heated-pool"
              disabled={editingId !== null}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:bg-neutral-100"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-neutral-500">
              Label FR
            </label>
            <input
              type="text"
              value={form.labelFr}
              onChange={(e) => setForm({ ...form, labelFr: e.target.value })}
              placeholder="Piscine chauffée"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-neutral-500">
              Label EN
            </label>
            <input
              type="text"
              value={form.labelEn}
              onChange={(e) => setForm({ ...form, labelEn: e.target.value })}
              placeholder="Heated pool"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          {/* Icône — sélecteur visuel */}
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-neutral-500">
              Icône
            </label>
            <button
              type="button"
              onClick={() => setShowIconPicker((v) => !v)}
              className="flex w-full items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-xs outline-none transition hover:border-primary focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                {selectedIconElement}
              </span>
              <span className="text-neutral-700">
                {ICON_OPTIONS.find((i) => i.value === form.icon)?.label || "Choisir une icône…"}
              </span>
              <svg className="ml-auto h-3 w-3 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-neutral-500">
              Catégorie
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Icon Picker Grid ─────────────────────────────── */}
        {showIconPicker && (
          <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
            <p className="mb-2 text-[11px] font-semibold text-neutral-500">
              Cliquez sur une icône pour la sélectionner :
            </p>
            <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8 lg:grid-cols-12">
              {ICON_OPTIONS.map((opt) => {
                const IconComp = opt.Icon;
                const isSelected = form.icon === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setForm({ ...form, icon: opt.value });
                      setShowIconPicker(false);
                    }}
                    title={opt.label}
                    className={`flex flex-col items-center gap-1 rounded-lg p-2 text-[9px] transition ${
                      isSelected
                        ? "bg-primary text-white shadow-sm"
                        : "text-neutral-600 hover:bg-white hover:shadow-sm"
                    }`}
                  >
                    <IconComp className="h-5 w-5" />
                    <span className="truncate leading-tight">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? "Enregistrement..." : editingId ? "Mettre à jour" : "Ajouter"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-full border border-neutral-200 px-5 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50"
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      {/* ── Filter ───────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-semibold text-neutral-500">
          Filtrer par catégorie :
        </label>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs outline-none focus:border-primary"
        >
          <option value="">Toutes ({amenities.length})</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label} ({amenities.filter((a) => a.category === c.value).length})
            </option>
          ))}
        </select>
      </div>

      {/* ── Table ────────────────────────────────────────────── */}
      {loading ? (
        <p className="text-sm text-neutral-500">Chargement…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50 text-left text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-3">Clé</th>
                <th className="px-4 py-3">FR</th>
                <th className="px-4 py-3">EN</th>
                <th className="px-4 py-3">Icône</th>
                <th className="px-4 py-3">Catégorie</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const RowIcon = getIcon(a.icon);
                return (
                  <tr
                    key={a.id}
                    className="border-b border-neutral-50 transition hover:bg-neutral-50"
                  >
                    <td className="px-4 py-2.5 font-mono text-neutral-600">
                      {a.key}
                    </td>
                    <td className="px-4 py-2.5">{a.labelFr}</td>
                    <td className="px-4 py-2.5">{a.labelEn}</td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1.5 text-neutral-600">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <RowIcon className="h-3.5 w-3.5" />
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          {a.icon ?? "—"}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        {CATEGORIES.find((c) => c.value === a.category)?.label ??
                          a.category ??
                          "—"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => handleEdit(a)}
                        className="mr-2 text-xs text-primary hover:underline"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-neutral-400"
                  >
                    Aucun équipement trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
