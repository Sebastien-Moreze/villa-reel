'use client';

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  guests: z.number().min(1),
  acceptCgv: z.literal(true),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  maxGuests: number;
  onValid: (data: FormValues) => void;
};

export function ReservationStep3({ maxGuests, onValid }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      guests: 2,
    },
  });

  const onSubmit = (data: FormValues) => {
    onValid(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 text-xs text-neutral-800"
    >
      <p className="text-sm font-semibold text-neutral-900">
        Informations voyageur principal
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-neutral-600">
            Prénom
          </label>
          <input
            type="text"
            {...register("firstName")}
            className="rounded-lg border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          {errors.firstName && (
            <p className="text-[10px] text-red-600">
              Ce champ est obligatoire.
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-neutral-600">
            Nom
          </label>
          <input
            type="text"
            {...register("lastName")}
            className="rounded-lg border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          {errors.lastName && (
            <p className="text-[10px] text-red-600">
              Ce champ est obligatoire.
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-neutral-600">
            Email
          </label>
          <input
            type="email"
            {...register("email")}
            className="rounded-lg border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          {errors.email && (
            <p className="text-[10px] text-red-600">
              Adresse email invalide.
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-neutral-600">
            Téléphone
          </label>
          <input
            type="tel"
            {...register("phone")}
            className="rounded-lg border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[11px] font-semibold text-neutral-600">
          Nombre de personnes
        </label>
        <input
          type="number"
          min={1}
          max={maxGuests}
          {...register("guests", { valueAsNumber: true })}
          className="w-24 rounded-lg border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
        {errors.guests && (
          <p className="text-[10px] text-red-600">
            Veuillez indiquer un nombre valide.
          </p>
        )}
        <p className="text-[10px] text-neutral-500">
          Jusqu&apos;à {maxGuests} personnes.
        </p>
      </div>

      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          {...register("acceptCgv")}
          className="mt-0.5 h-3 w-3 rounded border-neutral-300 text-primary"
        />
        <p className="text-[10px] text-neutral-600">
          J&apos;ai lu et j&apos;accepte les{" "}
          <a
            href="/cgv"
            target="_blank"
            className="text-primary underline"
          >
            Conditions Générales de Vente
          </a>
          .
        </p>
      </div>
      {errors.acceptCgv && (
        <p className="text-[10px] text-red-600">
          Vous devez accepter les CGV pour continuer.
        </p>
      )}

      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-md transition hover:opacity-90"
      >
        Continuer vers le paiement
      </button>
    </form>
  );
}

