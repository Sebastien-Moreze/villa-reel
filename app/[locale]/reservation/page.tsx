'use client';

import { useState } from "react";
import { ReservationStep1 } from "./ReservationStep1";
import { ReservationStep2 } from "./ReservationStep2";
import { ReservationStep3 } from "./ReservationStep3";
import { ReservationStep4 } from "./ReservationStep4";
import { ReservationStep5 } from "./ReservationStep5";

const STEPS = [
  "Dates",
  "Récapitulatif",
  "Voyageur",
  "Paiement",
  "Confirmation",
];

export default function ReservationPage() {
  const villaId = 1;
  const [step, setStep] = useState(0);

  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [nights, setNights] = useState(0);
  const [baseTotal, setBaseTotal] = useState(0);

  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);

  const [maxGuests] = useState(20);
  const [reservationId, setReservationId] = useState<number | null>(null);
  const [confirmationCode, setConfirmationCode] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="pb-16">
      <section className="bg-gradient-to-b from-primary via-primary/95 to-secondary py-12 text-white">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/80">
            Villa R.E.E.L
          </p>
          <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            Réserver votre séjour
          </h1>
          <p className="mt-2 max-w-xl text-xs text-white/90">
            Un tunnel de réservation en 5 étapes pour planifier sereinement
            votre expérience à la Villa R.E.E.L.
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
                maxGuests={maxGuests}
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
                      }),
                    });
                    if (!res.ok) {
                      const err = (await res.json()) as { error?: string };
                      setBookingError(err.error ?? "Erreur lors de la réservation.");
                      return;
                    }
                    const result = (await res.json()) as {
                      reservationId: number;
                      confirmationCode: string;
                      depositAmount: number;
                    };
                    setReservationId(result.reservationId);
                    // Mettre à jour l'acompte avec la valeur calculée côté serveur
                    setDepositAmount(result.depositAmount);
                    setStep(3);
                  } catch {
                    setBookingError("Erreur réseau. Veuillez réessayer.");
                  }
                }}
              />
            )}
            {step === 3 && reservationId && (
              <ReservationStep4
                reservationId={reservationId}
                depositAmount={depositAmount}
                onPaid={(code) => {
                  setConfirmationCode(code);
                  setStep(4);
                }}
              />
            )}
            {step === 3 && !reservationId && (
              <p className="text-xs text-red-600">
                Erreur : aucune réservation en cours. Veuillez recommencer.
              </p>
            )}
            {step === 4 && confirmationCode && (
              <ReservationStep5
                confirmationCode={confirmationCode}
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
              <p className="mt-3 text-[11px] font-semibold text-red-600">
                {bookingError}
              </p>
            )}

            {/* Navigation */}
            <div className="mt-6 flex items-center justify-between text-[11px] text-neutral-600">
              <button
                type="button"
                disabled={step === 0}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className="rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-[11px] font-semibold text-neutral-700 disabled:opacity-40"
              >
                Retour
              </button>
              {step < 3 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                  className="rounded-full bg-primary px-4 py-1.5 text-[11px] font-semibold text-white shadow-md hover:opacity-90"
                >
                  Étape suivante
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

