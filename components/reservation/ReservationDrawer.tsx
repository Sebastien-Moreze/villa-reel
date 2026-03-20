'use client';

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useReservation } from "@/components/reservation/ReservationContext";
import { ReservationStep1 } from "@/app/[locale]/reservation/ReservationStep1";
import { ReservationStep2 } from "@/app/[locale]/reservation/ReservationStep2";
import { ReservationStep3 } from "@/app/[locale]/reservation/ReservationStep3";
import { ReservationStep4 } from "@/app/[locale]/reservation/ReservationStep4";
import { ReservationStep5 } from "@/app/[locale]/reservation/ReservationStep5";

export function ReservationDrawer() {
  const { isOpen, closeDrawer } = useReservation();
  const t = useTranslations();
  const villaId = 1;

  /* ── State du formulaire ─────────────────────────────────────── */
  const [step, setStep] = useState(0);
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [nights, setNights] = useState(0);
  const [baseTotal, setBaseTotal] = useState(0);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [_depositAmount, setDepositAmount] = useState(0);
  const [reservationId, setReservationId] = useState<number | null>(null);
  const [reelCode, setReelCode] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const STEPS = [
    t("reservation.step1"),
    t("reservation.step2"),
    t("reservation.step3"),
    t("reservation.step4"),
    t("reservation.step5"),
  ];

  const progress = ((step + 1) / STEPS.length) * 100;

  /* ── Réinitialisation à la fermeture ─────────────────────────── */
  const handleClose = useCallback(() => {
    closeDrawer();
    // Petit délai pour laisser l'animation se terminer avant de reset
    setTimeout(() => {
      setStep(0);
      setCheckIn(null);
      setCheckOut(null);
      setGuests(2);
      setNights(0);
      setBaseTotal(0);
      setPromoCode(null);
      setTotal(0);
      setDepositAmount(0);
      setReservationId(null);
      setReelCode(null);
      setBookingError(null);
    }, 400);
  }, [closeDrawer]);

  /* ── Fermeture au clavier (Escape) ───────────────────────────── */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, handleClose]);

  /* ── Blocage du scroll body quand ouvert ─────────────────────── */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("reservation.title")}
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-background shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* En-tête avec stepper */}
        <div className="bg-gradient-to-b from-primary via-primary/95 to-secondary px-5 py-6 text-white flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/70">
                Villa R.E.E.L
              </p>
              <h2 className="font-display mt-1 text-lg font-semibold tracking-tight">
                {t("reservation.title")}
              </h2>
            </div>
            {/* Bouton fermer */}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Fermer"
              className="ml-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="h-4 w-4">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Stepper */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              {STEPS.map((label, index) => (
                <div
                  key={label}
                  className="flex flex-1 flex-col items-center"
                >
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold ${
                      index <= step ? "bg-white text-primary" : "bg-white/20 text-white"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="mt-1 text-[9px] text-white/80 text-center leading-tight hidden sm:block">
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white/80 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-6">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            {step === 0 && (
              <ReservationStep1
                villaId={villaId}
                onChange={({ checkIn, checkOut, guests, nights, total }) => {
                  setCheckIn(checkIn);
                  setCheckOut(checkOut);
                  setGuests(guests);
                  setNights(nights);
                  setBaseTotal(total);
                }}
              />
            )}
            {step === 1 && (
              <ReservationStep2
                villaId={villaId}
                checkIn={checkIn}
                checkOut={checkOut}
                nights={nights}
                baseTotal={baseTotal}
                onChange={({ promoCode, total, depositAmount }) => {
                  setPromoCode(promoCode);
                  setTotal(total);
                  setDepositAmount(depositAmount);
                }}
              />
            )}
            {step === 2 && (
              <ReservationStep3
                guests={guests}
                onValid={async (guestData) => {
                  setBookingError(null);
                  try {
                    const res = await fetch("/api/reservations/create", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        villaId,
                        checkIn,
                        checkOut,
                        nbGuests: guestData.guests,
                        guestName: `${guestData.firstName} ${guestData.lastName}`.trim(),
                        guestEmail: guestData.email,
                        guestPhone: guestData.phone,
                        promoCode: promoCode ?? undefined,
                        locale: "fr",
                        hcaptchaToken: guestData.hcaptchaToken,
                      }),
                    });
                    if (!res.ok) {
                      const err = (await res.json()) as { error?: string };
                      setBookingError(err.error ?? t("reservation.errorGeneric"));
                      return;
                    }
                    const result = (await res.json()) as {
                      reservationId: number;
                      confirmationCode: string;
                      totalAmount: number;
                    };
                    setReservationId(result.reservationId);
                    setReelCode(result.confirmationCode);
                    setStep(3);
                  } catch {
                    setBookingError(t("reservation.errorNetwork"));
                  }
                }}
              />
            )}
            {step === 3 && reservationId && reelCode && (
              <ReservationStep4
                reservationId={reservationId}
                totalAmount={total}
                confirmationCode={reelCode}
                onPaid={() => setStep(4)}
              />
            )}
            {step === 3 && (!reservationId || !reelCode) && (
              <p className="text-xs text-red-600">
                {t("reservation.errorNoReservation")}
              </p>
            )}
            {step === 4 && reelCode && (
              <ReservationStep5
                confirmationCode={reelCode}
                summary={{ checkIn, checkOut, nights, guests, total }}
              />
            )}

            {bookingError && (
              <p className="mt-3 text-[11px] font-semibold text-red-600">
                {bookingError}
              </p>
            )}
          </div>
        </div>

        {/* Navigation en bas */}
        {step < 4 && (
          <div className="flex-shrink-0 border-t border-neutral-100 bg-white px-5 py-4 flex items-center justify-between">
            <button
              type="button"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="rounded-full border border-neutral-300 bg-white px-5 py-2 text-xs font-semibold text-neutral-700 disabled:opacity-40 hover:bg-neutral-50 transition"
            >
              {t("reservation.back")}
            </button>
            {step < 3 && (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-white shadow-md hover:opacity-90 transition"
              >
                {t("reservation.next")}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
