'use client';

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ReservationStep1 } from "./ReservationStep1";
import { ReservationStep2 } from "./ReservationStep2";
import { ReservationStep3 } from "./ReservationStep3";
import { ReservationStep4 } from "./ReservationStep4";
import { ReservationStep5 } from "./ReservationStep5";

export default function ReservationPage() {
  const t = useTranslations();
  const villaId = 1;
  const [step, setStep] = useState(0);

  const STEPS = [
    t("reservation.step1"),
    t("reservation.step2"),
    t("reservation.step3"),
    t("reservation.step4"),
    t("reservation.step5"),
  ];

  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [nights, setNights] = useState(0);
  const [baseTotal, setBaseTotal] = useState(0);

  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [_depositAmount, setDepositAmount] = useState(0);

  const [reservationId, setReservationId] = useState<number | null>(null);
  const [reelCode, setReelCode] = useState<string | null>(null); // code REEL-XXXXXX
  const [bookingError, setBookingError] = useState<{ message: string; action?: "back-to-dates" } | null>(null);

  function getFriendlyError(raw: string): { message: string; action?: "back-to-dates" } {
    const msg = (raw ?? "").toLowerCase();
    if (msg.includes("dates not available") || msg.includes("unavailable") || msg.includes("conflict")) {
      return {
        message: "Ces dates ne sont malheureusement plus disponibles. Elles viennent peut-être d'être réservées par quelqu'un d'autre. Veuillez choisir de nouvelles dates.",
        action: "back-to-dates",
      };
    }
    if (msg.includes("minimum stay") || msg.includes("min_stay")) {
      return { message: "La durée minimale de séjour n'est pas respectée. Veuillez sélectionner au moins 2 nuits.", action: "back-to-dates" };
    }
    if (msg.includes("maximum stay") || msg.includes("max_stay")) {
      return { message: "La durée maximale de séjour est dépassée. Veuillez choisir une période plus courte.", action: "back-to-dates" };
    }
    if (msg.includes("too many guests")) {
      return { message: "Le nombre de voyageurs dépasse la capacité de la villa.", action: "back-to-dates" };
    }
    if (msg.includes("invalid dates") || msg.includes("check-out")) {
      return { message: "Les dates saisies ne sont pas valides. Vérifiez que la date de départ est bien après la date d'arrivée.", action: "back-to-dates" };
    }
    if (msg.includes("formulaire") || msg.includes("invalide") || msg.includes("vérifiez")) {
      return { message: "Certaines informations sont manquantes ou incorrectes. Veuillez revenir à l'étape des dates et recommencer.", action: "back-to-dates" };
    }
    if (msg.includes("villa not found") || msg.includes("not found")) {
      return { message: "La villa est introuvable. Veuillez recharger la page et réessayer.", action: "back-to-dates" };
    }
    if (msg.includes("network") || msg.includes("fetch")) {
      return { message: "Une erreur de connexion s'est produite. Vérifiez votre connexion internet et réessayez." };
    }
    return { message: "Une erreur inattendue s'est produite. Veuillez réessayer ou nous contacter à r.jedonne@gmail.com." };
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="pb-16">
      <section className="bg-gradient-to-b from-primary via-primary/95 to-secondary py-12 text-white">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/80">
            Villa R.E.E.L
          </p>
          <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            {t("reservation.title")}
          </h1>
          <p className="mt-2 max-w-xl text-xs text-white/90">
            {t("reservation.description")}
          </p>

          {/* Stepper */}
          <div className="mt-6 space-y-3">
            <div className="flex justify-between text-[11px] text-white/90">
              {STEPS.map((label, index) => (
                <div
                  key={label}
                  className={`flex flex-1 flex-col items-center ${
                    index < STEPS.length - 1 ? "pr-2" : ""
                  }`}
                >
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold ${
                      index <= step ? "bg-white text-primary" : "bg-white/20 text-white"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="mt-1 text-[10px]">{label}</span>
                </div>
              ))}
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-gradient-to-r from-white to-white/80 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-10">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
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

                  // Vérification préalable : dates obligatoires
                  if (!checkIn || !checkOut) {
                    setBookingError({
                      message: "Vos dates de séjour sont manquantes. Veuillez retourner à l'étape 1 et sélectionner vos dates d'arrivée et de départ.",
                      action: "back-to-dates",
                    });
                    return;
                  }

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
                      setBookingError(getFriendlyError(err.error ?? ""));
                      return;
                    }
                    const result = (await res.json()) as {
                      reservationId: number;
                      confirmationCode: string;
                      totalAmount: number;
                    };
                    setReservationId(result.reservationId);
                    setReelCode(result.confirmationCode); // stocke le code REEL
                    setStep(3);
                  } catch {
                    setBookingError(getFriendlyError("network"));
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
            {step === 3 && !reservationId && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center space-y-3">
                <div className="flex justify-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-xl">⚠️</div>
                </div>
                <p className="text-sm font-semibold text-red-800">Session expirée</p>
                <p className="text-xs text-red-700 leading-relaxed">
                  Votre session de réservation a expiré ou une erreur s&apos;est produite. Veuillez recommencer depuis le début.
                </p>
                <button
                  type="button"
                  onClick={() => { setBookingError(null); setReservationId(null); setStep(0); }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-red-700 px-5 py-2 text-[11px] font-semibold text-white transition hover:bg-red-800"
                >
                  ← Recommencer la réservation
                </button>
              </div>
            )}
            {step === 4 && reelCode && (
              <ReservationStep5
                confirmationCode={reelCode}
                summary={{
                  checkIn,
                  checkOut,
                  nights,
                  guests,
                  total,
                }}
              />
            )}

            {/* Erreur de réservation */}
            {bookingError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-base">
                    ⚠️
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-800">
                      Oups, quelque chose s&apos;est passé
                    </p>
                    <p className="mt-1 text-xs text-red-700 leading-relaxed">
                      {bookingError.message}
                    </p>
                    {bookingError.action === "back-to-dates" && (
                      <button
                        type="button"
                        onClick={() => { setBookingError(null); setStep(0); }}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-red-700 px-4 py-1.5 text-[11px] font-semibold text-white transition hover:bg-red-800"
                      >
                        ← Modifier mes dates
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-6 flex items-center justify-between text-[11px] text-neutral-600">
              <button
                type="button"
                disabled={step === 0}
                onClick={() => { setBookingError(null); setStep((s) => Math.max(0, s - 1)); }}
                className="rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-[11px] font-semibold text-neutral-700 disabled:opacity-40"
              >
                {t("reservation.back")}
              </button>
              {/* Bouton Suivant uniquement sur les étapes 0 et 1 — l'étape 2 (voyageur) a son propre bouton de soumission */}
              {step < 2 && (
                <button
                  type="button"
                  disabled={step === 0 && (!checkIn || !checkOut)}
                  onClick={() => { setBookingError(null); setStep((s) => Math.min(STEPS.length - 1, s + 1)); }}
                  className="rounded-full bg-primary px-4 py-1.5 text-[11px] font-semibold text-white shadow-md hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  title={step === 0 && (!checkIn || !checkOut) ? "Veuillez d'abord sélectionner vos dates" : undefined}
                >
                  {t("reservation.next")}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

