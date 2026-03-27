"use client";

import { useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { submitContact } from "@/app/[locale]/contact/actions";

type ContactFormProps = {
  locale: string;
};

export function ContactForm({ locale }: ContactFormProps) {
  const t = useTranslations();
  const formRef = useRef<HTMLFormElement>(null);

  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Form submit ───────────────────────────────────────────────────────────
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    startTransition(async () => {
      const result = await submitContact(fd);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error);
      }
    });
  }

  // ── Success state ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-7 w-7 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-neutral-800">
          {t("contact.form.successTitle")}
        </p>
        <p className="mt-2 text-xs text-neutral-500">
          {t("contact.form.successDesc")}
        </p>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────
  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-4 text-xs"
    >
      <div className="grid gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="firstName" className="text-[11px] font-semibold text-neutral-600">
            {t("contact.form.firstName")}
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            className="rounded-lg border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="lastName" className="text-[11px] font-semibold text-neutral-600">
            {t("contact.form.lastName")}
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            className="rounded-lg border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="phone" className="text-[11px] font-semibold text-neutral-600">
            {t("contact.form.phone")}
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="rounded-lg border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-[11px] font-semibold text-neutral-600">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="rounded-lg border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="address" className="text-[11px] font-semibold text-neutral-600">
          {t("contact.form.address")}
        </label>
        <input
          id="address"
          name="address"
          type="text"
          className="rounded-lg border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="subject" className="text-[11px] font-semibold text-neutral-600">
          {t("contact.form.subject")}
        </label>
        <select
          id="subject"
          name="subject"
          required
          className="rounded-lg border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        >
          <option value="">{t("contact.form.subjectPlaceholder")}</option>
          <option value="sejour">{t("contact.form.subjectStay")}</option>
          <option value="entreprise">{t("contact.form.subjectBusiness")}</option>
          <option value="evenement">{t("contact.form.subjectEvent")}</option>
          <option value="collaboration">{t("contact.form.subjectCollab")}</option>
          <option value="autre">{t("contact.form.subjectOther")}</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="message" className="text-[11px] font-semibold text-neutral-600">
          {t("contact.form.message")}
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="rounded-lg border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          placeholder={t("contact.form.messagePlaceholder")}
        />
      </div>

      {/* Honeypot anti-spam — invisible pour les humains */}
      <div className="absolute opacity-0 top-0 left-0 h-0 w-0 -z-10 overflow-hidden" aria-hidden="true" tabIndex={-1}>
        <label htmlFor="website">Website</label>
        <input type="text" id="website" name="website" autoComplete="off" tabIndex={-1} />
      </div>

      {/* Champs cachés */}
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="h-captcha-response" value="honeypot" />

      <div className="flex items-start gap-2">
        <input
          id="consent"
          name="consent"
          type="checkbox"
          required
          className="mt-0.5 h-3 w-3 rounded border-neutral-300 text-primary"
        />
        <label htmlFor="consent" className="text-[10px] text-neutral-600">
          {t("contact.form.consent")}
        </label>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-[11px] text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary px-5 py-2.5 text-xs font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? t("contact.form.submitting") : t("contact.form.submit")}
      </button>
    </form>
  );
}