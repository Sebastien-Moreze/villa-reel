'use client';

import { useEffect, useState } from "react";
import { subMonths, addMonths, startOfMonth, endOfMonth } from "date-fns";
import { useTranslations, useLocale } from "next-intl";

type AvailabilityCalendarProps = {
  villaId: number;
};

type BlockedRange = {
  startDate: string;
  endDate: string;
};

export function AvailabilityCalendar({ villaId }: AvailabilityCalendarProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [blocked, setBlocked] = useState<BlockedRange[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/availability?villaId=${villaId}`);
        if (!res.ok) return;
        const data = (await res.json()) as { blocked: BlockedRange[] };
        setBlocked(data.blocked ?? []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [villaId]);

  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const daysInMonth = end.getDate();

  const isBlocked = (date: Date) => {
    const d = date.toISOString().split("T")[0];
    return blocked.some(
      (range) =>
        range.startDate <= range.endDate &&
        d >= range.startDate &&
        d <= range.endDate,
    );
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = new Date(start);
    day.setDate(i + 1);
    return day;
  });

  // Day labels based on locale
  const dayLabels = locale === "en"
    ? ["M", "T", "W", "T", "F", "S", "S"]
    : ["L", "M", "M", "J", "V", "S", "D"];

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-xs text-neutral-800 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
          className="rounded-full border border-neutral-200 px-2 py-1 text-[11px] text-neutral-600 hover:bg-neutral-50"
        >
          ←
        </button>
        <div className="text-sm font-semibold">
          {currentMonth.toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", {
            month: "long",
            year: "numeric",
          })}
        </div>
        <button
          type="button"
          onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
          className="rounded-full border border-neutral-200 px-2 py-1 text-[11px] text-neutral-600 hover:bg-neutral-50"
        >
          →
        </button>
      </div>

      {loading && (
        <p className="mb-2 text-[11px] text-neutral-500">
          {t("calendar.loading")}
        </p>
      )}

      <div className="grid grid-cols-7 gap-1 text-[10px]">
        {dayLabels.map((d, i) => (
          <div key={i} className="py-1 text-center font-semibold text-neutral-500">
            {d}
          </div>
        ))}
        {days.map((day) => {
          const blockedDay = isBlocked(day);
          return (
            <div
              key={day.toISOString()}
              className={`flex h-8 items-center justify-center rounded-md border text-[11px] ${
                blockedDay
                  ? "border-red-200 bg-red-50 line-through text-red-600"
                  : "border-primary/20 bg-primary/10 text-primary"
              }`}
            >
              {day.getDate()}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between text-[10px] text-neutral-500">
        <div className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-sm bg-primary/40" /> {t("calendar.available")}
        </div>
        <div className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-sm bg-red-200" /> {t("calendar.unavailable")}
        </div>
      </div>
    </div>
  );
}

