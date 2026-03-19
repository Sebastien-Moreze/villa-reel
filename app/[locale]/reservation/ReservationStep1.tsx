'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import { fr } from "date-fns/locale";
import {
  differenceInCalendarDays,
  format,
  isBefore,
  isWithinInterval,
  parseISO,
  startOfDay,
} from "date-fns";
import { useTranslations } from "next-intl";

type Props = {
  villaId: number;
  onChange: (data: {
    checkIn: string | null;
    checkOut: string | null;
    guests: number;
    nights: number;
    total: number;
  }) => void;
};

type BookingInfo = {
  maxGuests: number;
  minStay: number;
  maxStay: number | null;
  pricePerNight: number;
  cleaningFee: number;
  deposit: number;
};

type BlockedRange = { startDate: string; endDate: string };

export function ReservationStep1({ villaId, onChange }: Props) {
  const t = useTranslations();
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);
  const [blockedRanges, setBlockedRanges] = useState<BlockedRange[]>([]);
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [guests, setGuests] = useState(2);

  const today = useMemo(() => startOfDay(new Date()), []);

  // ── Fetch booking info + availability ──────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [infoRes, availRes] = await Promise.all([
          fetch(`/api/villa/booking-info?villaId=${villaId}`),
          fetch(`/api/availability?villaId=${villaId}`),
        ]);
        if (infoRes.ok) setBookingInfo(await infoRes.json());
        if (availRes.ok) {
          const data = (await availRes.json()) as { blocked: BlockedRange[] };
          setBlockedRanges(data.blocked ?? []);
        }
      } catch {
        // ignore network errors silently
      }
    };
    fetchData();
  }, [villaId]);

  // ── Build disabled-day function ────────────────────────────────────────
  const isDateDisabled = useCallback(
    (date: Date): boolean => {
      if (isBefore(date, today)) return true;
      return blockedRanges.some((r) =>
        isWithinInterval(date, {
          start: parseISO(r.startDate),
          end: parseISO(r.endDate),
        }),
      );
    },
    [blockedRanges, today],
  );

  // ── Range selection handler — reset if selection spans a blocked day ───
  const handleRangeSelect = useCallback(
    (newRange: DateRange | undefined) => {
      if (!newRange) {
        setRange(undefined);
        return;
      }
      const { from, to } = newRange;
      if (from && to) {
        // Check for blocked dates overlapping the selected range
        const hasBlocked = blockedRanges.some((r) => {
          const bStart = parseISO(r.startDate);
          const bEnd = parseISO(r.endDate);
          // Overlap: blocked range intersects selection
          return !(bEnd < from || bStart > to);
        });
        if (hasBlocked) {
          // Keep only the start — force user to pick a valid end
          setRange({ from });
          return;
        }
      }
      setRange(newRange);
    },
    [blockedRanges],
  );

  // ── Derived values ─────────────────────────────────────────────────────
  const checkIn = range?.from ? format(range.from, "yyyy-MM-dd") : null;
  const checkOut = range?.to ? format(range.to, "yyyy-MM-dd") : null;

  const nights = useMemo(() => {
    if (!range?.from || !range.to) return 0;
    return Math.max(differenceInCalendarDays(range.to, range.from), 0);
  }, [range]);

  const computedError = useMemo(() => {
    if (!bookingInfo || !range?.from || !range.to) return null;
    if (nights <= 0) return t("reservation.errors.invalidRange");
    if (nights < bookingInfo.minStay)
      return t("reservation.errors.minStay", { min: bookingInfo.minStay });
    if (bookingInfo.maxStay && nights > bookingInfo.maxStay)
      return t("reservation.errors.maxStay", { max: bookingInfo.maxStay });
    return null;
  }, [bookingInfo, range, nights, t]);

  // ── Propagate changes to parent ────────────────────────────────────────
  useEffect(() => {
    if (!bookingInfo || !checkIn || !checkOut || computedError) {
      onChange({ checkIn, checkOut, guests, nights: 0, total: 0 });
      return;
    }
    const total =
      nights * bookingInfo.pricePerNight +
      bookingInfo.cleaningFee +
      bookingInfo.deposit;
    onChange({ checkIn, checkOut, guests, nights, total });
  }, [bookingInfo, checkIn, checkOut, guests, nights, computedError, onChange]);

  // ── Formatted display dates ────────────────────────────────────────────
  const fmtDate = (d: Date) =>
    format(d, "d MMMM yyyy", { locale: fr });

  return (
    <div className="space-y-5 text-xs text-neutral-800">
      <p className="text-sm font-semibold text-neutral-900">
        {t("reservation.step1Title")}
      </p>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-[10px] text-neutral-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-primary" />
          Dates sélectionnées
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-neutral-200" />
          Non disponible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full border border-primary bg-white" />
          Aujourd&apos;hui
        </span>
      </div>

      {/* Calendar */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
        <DayPicker
          mode="range"
          selected={range}
          onSelect={handleRangeSelect}
          disabled={isDateDisabled}
          locale={fr}
          startMonth={today}
          numberOfMonths={1}
          showOutsideDays={false}
        />
      </div>

      {/* Selection summary */}
      {(range?.from || range?.to) && (
        <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3 text-[11px] text-neutral-700 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-neutral-500">Arrivée</span>
            <span className="font-semibold text-neutral-900">
              {range.from ? fmtDate(range.from) : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-neutral-500">Départ</span>
            <span className="font-semibold text-neutral-900">
              {range.to ? fmtDate(range.to) : <span className="italic text-neutral-400">Sélectionnez une date</span>}
            </span>
          </div>
          {nights > 0 && !computedError && (
            <div className="flex items-center justify-between border-t border-neutral-100 pt-1 mt-1">
              <span className="font-semibold text-neutral-500">Durée</span>
              <span className="font-semibold text-primary">{nights} nuit{nights > 1 ? "s" : ""}</span>
            </div>
          )}
        </div>
      )}

      {/* Guests */}
      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-semibold text-neutral-600">
          {t("reservation.guestsLabel")}
        </label>
        <input
          type="number"
          min={1}
          max={bookingInfo?.maxGuests ?? 20}
          value={guests}
          onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 1))}
          className="w-28 rounded-lg border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
        {bookingInfo && (
          <p className="text-[10px] text-neutral-500">
            {t("reservation.maxGuestsNote", { n: bookingInfo.maxGuests })}
          </p>
        )}
      </div>

      {/* Price info */}
      {bookingInfo && (
        <div className="rounded-xl bg-neutral-50 p-3 text-[11px] text-neutral-700">
          <p>
            {t("reservation.priceSummary", {
              price: bookingInfo.pricePerNight,
              cleaning: bookingInfo.cleaningFee,
              deposit: bookingInfo.deposit,
            })}
          </p>
        </div>
      )}

      {/* Validation error */}
      {computedError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-600">
          ⚠ {computedError}
        </p>
      )}

      {/* Hint when no dates yet */}
      {!range?.from && (
        <p className="text-[10px] text-neutral-400 text-center italic">
          Cliquez sur une date d&apos;arrivée, puis sur une date de départ pour sélectionner votre séjour.
        </p>
      )}
      {range?.from && !range.to && (
        <p className="text-[10px] text-amber-600 text-center font-medium">
          Maintenant sélectionnez votre date de départ.
        </p>
      )}
    </div>
  );
}
