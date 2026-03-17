'use client';

import { useEffect, useMemo, useState } from "react";
import { differenceInCalendarDays, parseISO } from "date-fns";

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
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [infoRes, availRes] = await Promise.all([
          fetch(`/api/villa/booking-info?villaId=${villaId}`),
          fetch(`/api/availability?villaId=${villaId}`),
        ]);
        if (infoRes.ok) {
          setBookingInfo(await infoRes.json());
        }
        if (availRes.ok) {
          const data = (await availRes.json()) as { blocked: BlockedRange[] };
          void data;
        }
      } catch {
        // ignore
      }
    };
    fetchData();
  }, [villaId]);

  const computedError = useMemo(() => {
    if (!bookingInfo || !checkIn || !checkOut) return null;

    const start = parseISO(checkIn);
    const end = parseISO(checkOut);
    const nights = Math.max(differenceInCalendarDays(end, start), 0);

    if (nights <= 0) {
      return "La date de départ doit être postérieure à la date d'arrivée.";
    }
    if (nights < bookingInfo.minStay) {
      return `Séjour minimum de ${bookingInfo.minStay} nuits.`;
    }
    if (bookingInfo.maxStay && nights > bookingInfo.maxStay) {
      return `Séjour maximum de ${bookingInfo.maxStay} nuits.`;
    }
    return null;
  }, [bookingInfo, checkIn, checkOut]);

  useEffect(() => {
    if (!bookingInfo || !checkIn || !checkOut) {
      onChange({
        checkIn,
        checkOut,
        guests,
        nights: 0,
        total: 0,
      });
      return;
    }

    const start = parseISO(checkIn);
    const end = parseISO(checkOut);
    const nights = Math.max(differenceInCalendarDays(end, start), 0);

    void error;

    const total =
      nights * bookingInfo.pricePerNight +
      bookingInfo.cleaningFee +
      bookingInfo.deposit;

    onChange({
      checkIn,
      checkOut,
      guests,
      nights: computedError ? 0 : nights,
      total: computedError ? 0 : total,
    });
  }, [bookingInfo, checkIn, checkOut, guests, onChange, computedError]);

  return (
    <div className="space-y-4 text-xs text-neutral-800">
      <p className="text-sm font-semibold text-neutral-900">
        Sélectionnez vos dates de séjour
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-neutral-600">
            Arrivée
          </label>
          <input
            type="date"
            value={checkIn ?? ""}
            onChange={(e) => setCheckIn(e.target.value || null)}
            className="rounded-lg border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-neutral-600">
            Départ
          </label>
          <input
            type="date"
            value={checkOut ?? ""}
            onChange={(e) => setCheckOut(e.target.value || null)}
            className="rounded-lg border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-semibold text-neutral-600">
          Nombre de voyageurs
        </label>
        <input
          type="number"
          min={1}
          max={bookingInfo?.maxGuests ?? 20}
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value) || 1)}
          className="w-28 rounded-lg border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
        {bookingInfo && (
          <p className="text-[10px] text-neutral-500">
            Jusqu&apos;à {bookingInfo.maxGuests} personnes.
          </p>
        )}
      </div>

      {bookingInfo && (
        <div className="rounded-xl bg-neutral-50 p-3 text-[11px] text-neutral-700">
          <p>
            Tarif indicatif :{" "}
            <span className="font-semibold">
              {bookingInfo.pricePerNight} € / nuit
            </span>{" "}
            + ménage ({bookingInfo.cleaningFee} €) + caution (
            {bookingInfo.deposit} €).
          </p>
        </div>
      )}

      {(computedError ?? error) && (
        <p className="text-[11px] font-semibold text-red-600">
          {computedError ?? error}
        </p>
      )}

      <p className="text-[10px] text-neutral-500">
        Les jours déjà réservés ou bloqués apparaissent comme indisponibles dans
        le calendrier.
      </p>
    </div>
  );
}

