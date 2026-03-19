"use client";

import { useEffect, useState } from "react";

type Props = {
  villaId: number;
  checkIn: string | null;
  checkOut: string | null;
  nights: number;
  baseTotal: number;
  onChange: (data: { promoCode: string | null; discount: number; total: number; depositAmount: number }) => void;
};

type BookingInfo = {
  pricePerNight: number;
  cleaningFee: number;
  deposit: number;
};

export function ReservationStep2({ villaId, checkIn, checkOut, nights, baseTotal, onChange }: Props) {
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [status, setStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/villa/booking-info?villaId=${villaId}`);
        if (res.ok) {
          const data = await res.json();
          setBookingInfo({
            pricePerNight: data.pricePerNight,
            cleaningFee: data.cleaningFee,
            deposit: data.deposit,
          });
        }
      } catch {
        // ignore
      }
    };
    load();
  }, [villaId]);

  useEffect(() => {
    const total = Math.max(baseTotal - discount, 0);
    onChange({ promoCode: promoCode || null, discount, total, depositAmount: 0 });
  }, [baseTotal, discount, promoCode, onChange]);

  const handleBlurPromo = async () => {
    const code = promoCode.trim();
    if (!code) {
      setDiscount(0);
      setStatus("idle");
      return;
    }
    setStatus("checking");
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, villaId, checkIn, checkOut }),
      });
      if (!res.ok) {
        setStatus("invalid");
        setDiscount(0);
        return;
      }
      const data = await res.json();
      if (!data.valid) {
        setStatus("invalid");
        setDiscount(0);
        return;
      }
      setStatus("valid");
      if (data.type === "PERCENT") {
        setDiscount(Math.round((baseTotal * data.value) / 100));
      } else {
        setDiscount(data.value);
      }
    } catch {
      setStatus("invalid");
      setDiscount(0);
    }
  };

  const total = Math.max(baseTotal - discount, 0);

  return (
    <div className="space-y-4 text-xs text-neutral-800">
      <p className="text-sm font-semibold text-neutral-900">Récapitulatif de votre séjour</p>

      {bookingInfo && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-3 text-[11px]">
          <div className="flex items-center justify-between">
            <span>Nombre de nuits</span>
            <span className="font-semibold">{nights} nuit(s)</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span>
              {bookingInfo.pricePerNight} € x {nights} nuit(s)
            </span>
            <span>{bookingInfo.pricePerNight * nights} €</span>
          </div>
          {discount > 0 && (
            <div className="mt-1 flex items-center justify-between text-primary">
              <span>Remise promo</span>
              <span>- {discount} €</span>
            </div>
          )}
          <div className="mt-2 border-t border-neutral-200 pt-2 font-semibold text-neutral-900">
            <div className="flex items-center justify-between">
              <span>Total séjour</span>
              <span>{total} €</span>
            </div>
          </div>
          <div className="mt-1 flex items-center justify-between text-neutral-500">
            <span>Caution (remboursée après séjour)</span>
            <span>{bookingInfo.deposit} €</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-primary font-semibold">
            <span>Paiement dû 30 jours avant l&apos;arrivée</span>
            <span>{total} €</span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-semibold text-neutral-600">Code promo</label>
        <input
          type="text"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          onBlur={handleBlurPromo}
          className="w-48 rounded-lg border border-neutral-200 px-3 py-2 text-xs uppercase outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          placeholder="WELCOME10"
        />
        {status === "checking" && (
          <p className="text-[10px] text-neutral-500">Vérification du code promo...</p>
        )}
        {status === "valid" && (
          <p className="text-[10px] text-primary">Code promo appliqué.</p>
        )}
        {status === "invalid" && (
          <p className="text-[10px] text-red-600">Code promo invalide ou expiré.</p>
        )}
      </div>

      <div className="rounded-xl bg-neutral-50 p-3 text-[10px] text-neutral-600">
        <p className="font-semibold">Politique d&apos;annulation souple</p>
        <p className="mt-1">
          Remboursement intégral si annulation plus de 14 jours avant l&apos;arrivée. Aucun remboursement en dessous de 14 jours. Conditions détaillées dans les CGV.
        </p>
      </div>
    </div>
  );
}

