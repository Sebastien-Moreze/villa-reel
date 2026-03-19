'use client';

import { useEffect, useState, useCallback } from "react";
import { useReservation } from "@/components/reservation/ReservationContext";

/* ── Helpers ──────────────────────────────────────────────────────────── */

type BlockedRange = { startDate: string; endDate: string };

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function isBlocked(dateStr: string, blocked: BlockedRange[]): boolean {
  return blocked.some((r) => dateStr >= r.startDate && dateStr <= r.endDate);
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

/** 0 = lundi … 6 = dimanche (semaine européenne) */
function firstDayOfWeek(year: number, month: number) {
  const js = new Date(year, month - 1, 1).getDay(); // 0=dim
  return (js + 6) % 7; // ramène lundi=0
}

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

/* ── Single-month calendar ────────────────────────────────────────────── */

function MonthCalendar({
  year,
  month,
  blocked,
  loading,
}: {
  year: number;
  month: number; // 1-12
  blocked: BlockedRange[];
  loading: boolean;
}) {
  const today = new Date().toISOString().split("T")[0];
  const days = daysInMonth(year, month);
  const firstDay = firstDayOfWeek(year, month);

  const cells: (number | null)[] = [
    ...Array<null>(firstDay).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];

  return (
    <div className="flex-1 min-w-0">
      <p className="mb-3 text-center text-sm font-semibold text-neutral-800">
        {MONTHS_FR[month - 1]} {year}
      </p>

      {/* En-têtes jours */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-neutral-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Grille des jours */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;
          const dateStr = toDateStr(year, month, day);
          const past = dateStr < today;
          const blocked_ = !past && isBlocked(dateStr, blocked);
          const available = !past && !blocked_;

          return (
            <div
              key={dateStr}
              title={blocked_ ? "Indisponible" : available ? "Disponible" : ""}
              className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition
                ${past ? "text-neutral-300 cursor-default" : ""}
                ${available ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : ""}
                ${blocked_ ? "bg-neutral-100 text-neutral-400 line-through cursor-default" : ""}
                ${loading ? "opacity-40" : ""}
              `}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main modal ───────────────────────────────────────────────────────── */

export function AvailabilityModal() {
  const { isAvailabilityOpen, closeAvailability, openDrawer } = useReservation();

  const now = new Date();
  const [offset, setOffset] = useState(0); // 0 = mois courant + suivant
  const [blocked, setBlocked] = useState<BlockedRange[]>([]);
  const [loading, setLoading] = useState(false);

  // Calcule les deux mois à afficher en fonction de l'offset
  const getMonthYear = (delta: number) => {
    const d = new Date(now.getFullYear(), now.getMonth() + delta);
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  };

  const left = getMonthYear(offset);
  const right = getMonthYear(offset + 1);

  const fetchBlocked = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.all([
        fetch(`/api/availability?villaId=1&year=${left.year}&month=${left.month}`).then((r) => r.json()),
        fetch(`/api/availability?villaId=1&year=${right.year}&month=${right.month}`).then((r) => r.json()),
      ]);
      const combined: BlockedRange[] = [
        ...(results[0].blocked ?? []),
        ...(results[1].blocked ?? []),
      ];
      setBlocked(combined);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [left.year, left.month, right.year, right.month]);

  useEffect(() => {
    if (isAvailabilityOpen) fetchBlocked();
  }, [isAvailabilityOpen, fetchBlocked]);

  // Fermeture Escape
  useEffect(() => {
    if (!isAvailabilityOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeAvailability(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAvailabilityOpen, closeAvailability]);

  // Blocage scroll
  useEffect(() => {
    document.body.style.overflow = isAvailabilityOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isAvailabilityOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isAvailabilityOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeAvailability}
        aria-hidden="true"
      />

      {/* Modale centrée */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Disponibilités"
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
          isAvailabilityOpen ? "pointer-events-auto opacity-100 scale-100" : "pointer-events-none opacity-0 scale-95"
        }`}
      >
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden">

          {/* En-tête */}
          <div className="flex items-center justify-between bg-gradient-to-r from-primary to-secondary px-6 py-4 text-white">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/70">Villa R.E.E.L</p>
              <h2 className="font-display mt-0.5 text-base font-semibold">Disponibilités</h2>
            </div>
            <button
              type="button"
              onClick={closeAvailability}
              aria-label="Fermer"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="h-4 w-4">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Corps */}
          <div className="px-6 py-5">

            {/* Navigation mois */}
            <div className="flex items-center justify-between mb-5">
              <button
                type="button"
                onClick={() => setOffset((o) => o - 1)}
                disabled={offset <= 0}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-30 transition"
                aria-label="Mois précédents"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className="h-4 w-4">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>

              <span className="text-xs text-neutral-500">
                {MONTHS_FR[left.month - 1]} — {MONTHS_FR[right.month - 1]} {right.year}
              </span>

              <button
                type="button"
                onClick={() => setOffset((o) => o + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition"
                aria-label="Mois suivants"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className="h-4 w-4">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>

            {/* Deux calendriers côte à côte */}
            <div className="flex gap-6">
              <MonthCalendar
                year={left.year}
                month={left.month}
                blocked={blocked}
                loading={loading}
              />
              <div className="w-px bg-neutral-100" />
              <MonthCalendar
                year={right.year}
                month={right.month}
                blocked={blocked}
                loading={loading}
              />
            </div>

            {/* Légende */}
            <div className="mt-4 flex items-center gap-5 text-[11px] text-neutral-500">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-full bg-emerald-100 border border-emerald-200" />
                Disponible
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-full bg-neutral-200" />
                Indisponible
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-full bg-white border border-neutral-200" />
                Passé
              </span>
            </div>
          </div>

          {/* Pied */}
          <div className="border-t border-neutral-100 px-6 py-4 flex items-center justify-between bg-neutral-50">
            <p className="text-xs text-neutral-500">
              Une date disponible vous convient ?
            </p>
            <button
              type="button"
              onClick={() => { closeAvailability(); openDrawer(); }}
              className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-white shadow-md hover:opacity-90 transition"
            >
              Réserver maintenant
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
