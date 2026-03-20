'use client';

import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Script from "next/script";

// La déclaration globale Window.hcaptcha est dans types/hcaptcha.d.ts

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  acceptCgv: z.literal(true),
  acceptReglement: z.literal(true),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  guests: number;
  onValid: (data: FormValues & { guests: number; hcaptchaToken?: string }) => void;
};

const SECTIONS = [
  {
    num: "1", title: "Arrivée & Départ",
    items: [
      "Check-in à partir de 15h.",
      "Check-out avant 15h.",
      "Toute demande d'arrivée anticipée ou de départ tardif doit être validée au préalable.",
      "Merci de respecter ces horaires afin de garantir une préparation irréprochable pour chaque séjour.",
    ],
  },
  {
    num: "2", title: "Occupation des lieux",
    items: [
      "La villa est exclusivement réservée aux voyageurs déclarés lors de la réservation.",
      "Toute personne supplémentaire non autorisée entraînera l'annulation immédiate du séjour sans remboursement.",
      "La sous-location est strictement interdite.",
    ],
  },
  {
    num: "3", title: "Respect du voisinage & tranquillité",
    items: [
      "Les fêtes, événements et soirées non autorisés sont strictement interdits.",
      "Le calme doit être respecté entre 22h et 8h.",
      "Toute nuisance sonore excessive pourra entraîner l'interruption immédiate du séjour.",
    ],
  },
  {
    num: "4", title: "Piscine & espaces extérieurs",
    items: [
      "L'utilisation de la piscine et des installations extérieures se fait sous votre entière responsabilité.",
      "Les enfants doivent être surveillés en permanence.",
      "Il est interdit de courir ou de plonger si la profondeur ne le permet pas.",
      "Les verres et objets cassables sont interdits autour de la piscine.",
      "Merci de respecter le mobilier extérieur et de le laisser à son emplacement initial.",
    ],
  },
  {
    num: "5", title: "Propreté & soin des lieux",
    items: [
      "La villa vous est confiée dans un état impeccable.",
      "Respecter les équipements et le mobilier.",
      "Laisser la cuisine propre (vaisselle faite, plans de travail nettoyés).",
      "Trier et sortir les déchets conformément aux consignes locales.",
      "Signaler immédiatement tout incident ou dommage.",
      "Toute dégradation ou négligence sera facturée.",
    ],
  },
  {
    num: "6", title: "Mobilier & équipements",
    items: [
      "Le mobilier intérieur ne doit pas être déplacé vers l'extérieur.",
      "Les serviettes de bain ne doivent pas être utilisées pour la piscine — des serviettes dédiées sont fournies.",
      "Les appareils électriques, lumières, climatisation et chauffage doivent être éteints lors de votre départ.",
    ],
  },
  {
    num: "7", title: "Interdiction de fumer",
    items: [
      "La villa est entièrement non-fumeur.",
      "Toute trace d'odeur ou de consommation à l'intérieur entraînera des frais de remise en état.",
    ],
  },
  {
    num: "8", title: "Animaux",
    items: ["Les animaux ne sont pas acceptés."],
  },
  {
    num: "9", title: "Sécurité",
    items: [
      "Merci de fermer portes, fenêtres et portail lors de vos absences.",
      "Le propriétaire décline toute responsabilité en cas de perte, vol ou accident.",
      "L'utilisation des équipements se fait sous votre responsabilité.",
    ],
  },
  {
    num: "10", title: "Respect du standing",
    items: [
      "Cette villa est un lieu d'exception destiné à une clientèle recherchant confort, élégance et discrétion.",
      "Nous comptons sur votre sens des responsabilités afin que chaque séjour reste une expérience haut de gamme, tant pour vous que pour les futurs voyageurs.",
    ],
  },
];

function ReglementModal({
  onSigned,
  onClose,
}: {
  onSigned: () => void;
  onClose: () => void;
}) {
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [checked, setChecked] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 32;
      if (atBottom) setScrolledToBottom(true);
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleValidate = () => {
    setConfirmed(true);
    setTimeout(() => {
      onSigned();
      onClose();
    }, 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative flex w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl"
        style={{ maxHeight: "90vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary/60">Villa R.E.E.L</p>
            <h2 className="text-sm font-bold text-neutral-900">Règlement intérieur</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 text-xs font-bold"
          >
            ✕
          </button>
        </div>

        {/* Intro */}
        <div className="px-5 pt-4 pb-2">
          <p className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-[10px] text-amber-800 italic leading-relaxed">
            Merci de lire attentivement l&apos;intégralité du règlement avant de pouvoir le signer. La case d&apos;approbation s&apos;active une fois que vous avez atteint la fin du document.
          </p>
        </div>

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-5 py-3 space-y-3"
          style={{ overscrollBehavior: "contain" }}
        >
          <p className="text-[11px] text-neutral-500 italic leading-relaxed">
            Nous sommes heureux de vous accueillir dans notre villa et vous remercions pour votre confiance.
            Cette propriété a été pensée comme un lieu d&apos;exception. Nous vous remercions de contribuer
            à préserver son standing et sa sérénité.
          </p>

          {SECTIONS.map((section) => (
            <div key={section.num} className="rounded-lg border border-neutral-100 bg-neutral-50 p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                  {section.num}
                </span>
                <p className="text-[11px] font-semibold text-neutral-800">{section.title}</p>
              </div>
              <ul className="space-y-1 ml-7">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[10px] text-neutral-600">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/40" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Signature de fin */}
          <div className="rounded-lg bg-neutral-900 px-4 py-3 text-[10px] text-neutral-300 leading-relaxed">
            <p>En cochant la case ci-dessous, vous confirmez avoir lu et accepté l&apos;intégralité du règlement intérieur de la Villa R.E.E.L. Tout manquement pourra entraîner des frais supplémentaires ou l&apos;interruption du séjour.</p>
            <p className="mt-2 text-right font-semibold italic text-secondary text-[11px]">— Estelle & Rodrigue</p>
          </div>
        </div>

        {/* Footer sticky — case + bouton */}
        <div className="border-t border-neutral-100 px-5 py-4 space-y-3 bg-white rounded-b-2xl">
          {!confirmed ? (
            <>
              {!scrolledToBottom && (
                <p className="text-[10px] text-neutral-400 text-center">
                  ↓ Faites défiler jusqu&apos;en bas pour débloquer la signature
                </p>
              )}
              <label className={`flex items-start gap-2 cursor-pointer rounded-lg p-2 transition ${scrolledToBottom ? "bg-emerald-50 border border-emerald-200" : "opacity-40 cursor-not-allowed"}`}>
                <input
                  type="checkbox"
                  disabled={!scrolledToBottom}
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 rounded border-neutral-300 accent-emerald-600 disabled:cursor-not-allowed"
                />
                <span className="text-[11px] font-medium text-neutral-700 leading-relaxed">
                  J&apos;ai lu et j&apos;approuve le règlement intérieur de la Villa R.E.E.L — je m&apos;engage à le respecter pendant toute la durée de mon séjour.
                </span>
              </label>

              <button
                type="button"
                disabled={!checked}
                onClick={handleValidate}
                className="w-full rounded-full bg-primary py-2.5 text-xs font-semibold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Valider ma signature
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 py-2 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-lg font-bold">
                ✓
              </div>
              <p className="text-sm font-semibold text-emerald-700">Règlement signé</p>
              <p className="text-[10px] text-neutral-500">
                Vous pouvez continuer votre réservation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ReservationStep3({ guests, onValid }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [reglementSigned, setReglementSigned] = useState(false);

  /* ── hCaptcha refs ───────────────────────────────────────────────── */
  const captchaContainerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const pendingDataRef = useRef<(FormValues & { guests: number }) | null>(null);
  // Ref stable vers onValid pour éviter de ré-initialiser le widget à chaque render
  const onValidRef = useRef(onValid);
  useEffect(() => { onValidRef.current = onValid; }, [onValid]);

  /* ── React Hook Form — doit précéder les callbacks qui utilisent setValue ── */
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const handleSigned = () => {
    setReglementSigned(true);
    setValue("acceptReglement", true, { shouldValidate: true });
  };

  // Initialise le widget hCaptcha quand le script JS est chargé
  const initHCaptcha = useCallback(() => {
    if (!captchaContainerRef.current || !window.hcaptcha) return;
    const siteKey =
      process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ??
      "10000000-ffff-ffff-ffff-000000000001"; // clé de test hCaptcha
    widgetIdRef.current = window.hcaptcha.render(captchaContainerRef.current, {
      sitekey: siteKey,
      size: "invisible",
      callback: (token: string) => {
        if (pendingDataRef.current) {
          onValidRef.current({ ...pendingDataRef.current, hcaptchaToken: token });
          pendingDataRef.current = null;
        }
        if (widgetIdRef.current !== null) {
          window.hcaptcha?.reset(widgetIdRef.current);
        }
      },
      "error-callback": () => {
        pendingDataRef.current = null;
        if (widgetIdRef.current !== null) {
          window.hcaptcha?.reset(widgetIdRef.current);
        }
      },
    });
  }, []);

  const handleFormSubmit = useCallback(
    (data: FormValues) => {
      const payload = { ...data, guests };
      if (window.hcaptcha && widgetIdRef.current !== null) {
        pendingDataRef.current = payload;
        window.hcaptcha.execute(widgetIdRef.current);
      } else {
        // Pas de widget hCaptcha (dev ou script non chargé) → on laisse passer
        onValidRef.current({ ...payload, hcaptchaToken: undefined });
      }
    },
    [guests],
  );

  return (
    <>
      {modalOpen && (
        <ReglementModal
          onSigned={handleSigned}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* Script hCaptcha — chargé une seule fois, après l'interactif */}
      <Script
        src="https://js.hcaptcha.com/1/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={initHCaptcha}
      />
      {/* Conteneur invisible pour le widget hCaptcha */}
      <div ref={captchaContainerRef} />

      <form onSubmit={(e) => handleSubmit(handleFormSubmit)(e)} className="space-y-4 text-xs text-neutral-800">
        <p className="text-sm font-semibold text-neutral-900">Informations voyageur principal</p>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-neutral-600">Prénom</label>
            <input
              type="text"
              {...register("firstName")}
              className="rounded-lg border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            {errors.firstName && <p className="text-[10px] text-red-600">Ce champ est obligatoire.</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-neutral-600">Nom</label>
            <input
              type="text"
              {...register("lastName")}
              className="rounded-lg border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            {errors.lastName && <p className="text-[10px] text-red-600">Ce champ est obligatoire.</p>}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-neutral-600">Email</label>
            <input
              type="email"
              {...register("email")}
              className="rounded-lg border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            {errors.email && <p className="text-[10px] text-red-600">Adresse email invalide.</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-neutral-600">Téléphone</label>
            <input
              type="tel"
              {...register("phone")}
              className="rounded-lg border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* CGV */}
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            {...register("acceptCgv")}
            className="mt-0.5 h-3 w-3 rounded border-neutral-300 text-primary"
          />
          <p className="text-[10px] text-neutral-600">
            J&apos;ai lu et j&apos;accepte les{" "}
            <a href="/fr/cgv" target="_blank" className="text-primary underline">
              Conditions Générales de Vente
            </a>.
          </p>
        </div>
        {errors.acceptCgv && (
          <p className="text-[10px] text-red-600">Vous devez accepter les CGV pour continuer.</p>
        )}

        {/* Règlement intérieur */}
        <input type="hidden" {...register("acceptReglement")} />

        {!reglementSigned ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
            <div>
              <p className="text-[11px] font-semibold text-amber-900">
                📋 Signature du règlement intérieur obligatoire
              </p>
              <p className="mt-1 text-[10px] text-amber-700 leading-relaxed">
                Avant de continuer vers le paiement, vous devez lire et signer le règlement intérieur de la villa. Sans cette étape, la réservation ne peut pas être validée.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-amber-800 px-4 py-2 text-[11px] font-semibold text-white shadow-sm transition hover:bg-amber-900"
            >
              <span>📄</span>
              Lire et signer le règlement intérieur
            </button>
            {errors.acceptReglement && (
              <p className="text-[10px] text-red-600 font-medium">
                ⚠ Vous devez signer le règlement intérieur pour continuer.
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white text-sm font-bold">
              ✓
            </div>
            <div>
              <p className="text-[11px] font-semibold text-emerald-800">
                Règlement intérieur signé
              </p>
              <p className="text-[10px] text-emerald-700">
                Vous avez signé le règlement intérieur — vous pouvez continuer votre réservation.
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setReglementSigned(false); setValue("acceptReglement", undefined as unknown as true); setModalOpen(true); }}
              className="ml-auto text-[10px] text-emerald-600 underline hover:text-emerald-800"
            >
              Relire
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={!reglementSigned}
          className="inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continuer vers le paiement
        </button>
        {!reglementSigned && (
          <p className="text-center text-[10px] text-neutral-400">
            Signez le règlement intérieur pour débloquer cette étape.
          </p>
        )}
      </form>
    </>
  );
}

