'use client';

import { useState } from "react";

type Props = {
  action: (formData: FormData) => void;
};

export function BlockDateForm({ action }: Props) {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    const start = (form.elements.namedItem("startDate") as HTMLInputElement)?.value;
    const end = (form.elements.namedItem("endDate") as HTMLInputElement)?.value;

    if (start && end && start > end) {
      e.preventDefault();
      setError("La date de début doit être antérieure ou égale à la date de fin.");
      return;
    }
    setError(null);
  };

  return (
    <form
      className="space-y-3 rounded-xl border border-neutral-800 bg-[#020617] p-4"
      action={action}
      onSubmit={handleSubmit}
    >
      <p className="text-xs font-semibold text-neutral-100">
        Ajouter un blocage
      </p>
      {error && (
        <p className="rounded-lg border border-cta/40 bg-cta/10 px-3 py-2 text-[11px] font-semibold text-cta">
          {error}
        </p>
      )}
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-neutral-400">Du</label>
        <input
          type="date"
          name="startDate"
          className="rounded-lg border border-neutral-700 bg-black px-2 py-1.5 text-[11px] text-neutral-100 outline-none focus:border-primary"
          required
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-neutral-400">Au</label>
        <input
          type="date"
          name="endDate"
          className="rounded-lg border border-neutral-700 bg-black px-2 py-1.5 text-[11px] text-neutral-100 outline-none focus:border-primary"
          required
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-neutral-400">Raison</label>
        <select
          name="reason"
          className="rounded-lg border border-neutral-700 bg-black px-2 py-1.5 text-[11px] text-neutral-100 outline-none focus:border-primary"
          defaultValue="OWNER"
        >
          <option value="OWNER">Propriétaire</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="RESERVATION">Réservation externe</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[11px] text-neutral-400">Notes</label>
        <textarea
          name="notes"
          rows={3}
          className="rounded-lg border border-neutral-700 bg-black px-2 py-1.5 text-[11px] text-neutral-100 outline-none focus:border-primary"
        />
      </div>
      <button
        type="submit"
        className="mt-1 inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2 text-[11px] font-semibold text-white shadow-md hover:opacity-90"
      >
        Bloquer ces dates
      </button>
    </form>
  );
}
