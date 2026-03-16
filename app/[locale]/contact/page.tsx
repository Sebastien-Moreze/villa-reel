import { z } from "zod";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: { locale: string };
};

const contactSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(10),
  locale: z.enum(["fr", "en"]).default("fr"),
  consent: z.literal("on"),
  token: z.string().min(1),
});

async function verifyHCaptcha(token: string) {
  "use server";

  const secret = process.env.HCAPTCHA_SECRET;
  if (!secret) return false;

  try {
    const res = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret,
        response: token,
      }),
    });
    const data = (await res.json()) as { success?: boolean };
    return !!data.success;
  } catch {
    return false;
  }
}

async function sendEmails(input: z.infer<typeof contactSchema>) {
  "use server";

  const resendApiKey = process.env.RESEND_API_KEY;
  const toOwner = process.env.CONTACT_EMAIL;

  if (!resendApiKey || !toOwner) return;

  const resend = new Resend(resendApiKey);

  const subjectOwner = `Nouveau message depuis le site Villa R.E.E.L – ${input.subject}`;
  const subjectGuest =
    input.locale === "en"
      ? "We have received your message – Villa R.E.E.L"
      : "Nous avons bien reçu votre message – Villa R.E.E.L";

  const ownerHtml = `
    <p>Nouveau message de contact sur le site Villa R.E.E.L :</p>
    <ul>
      <li><strong>Nom :</strong> ${input.firstName} ${input.lastName}</li>
      <li><strong>Email :</strong> ${input.email}</li>
      <li><strong>Téléphone :</strong> ${input.phone ?? "-"}</li>
      <li><strong>Adresse :</strong> ${input.address ?? "-"}</li>
      <li><strong>Objet :</strong> ${input.subject}</li>
    </ul>
    <p><strong>Message :</strong></p>
    <p>${input.message.replace(/\n/g, "<br />")}</p>
  `;

  const guestHtml =
    input.locale === "en"
      ? `
        <p>Hello ${input.firstName},</p>
        <p>Thank you for contacting Villa R.E.E.L. We have received your message and will get back to you as soon as possible.</p>
        <p>Best regards,<br/>Villa R.E.E.L</p>
      `
      : `
        <p>Bonjour ${input.firstName},</p>
        <p>Merci pour votre message. Nous l'avons bien reçu et reviendrons vers vous dans les plus brefs délais.</p>
        <p>Cordialement,<br/>Villa R.E.E.L</p>
      `;

  await resend.emails.send({
    from: "Villa R.E.E.L <no-reply@villareel.fr>",
    to: [toOwner],
    subject: subjectOwner,
    html: ownerHtml,
  });

  await resend.emails.send({
    from: "Villa R.E.E.L <no-reply@villareel.fr>",
    to: [input.email],
    subject: subjectGuest,
    html: guestHtml,
  });
}

async function submitContact(formData: FormData) {
  "use server";

  const raw = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone") || undefined,
    address: formData.get("address") || undefined,
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
    locale: (formData.get("locale") as string | null) ?? "fr",
    consent: formData.get("consent"),
    token: formData.get("h-captcha-response") ?? "",
  };

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    console.error("Contact form validation error", parsed.error.flatten());
    return;
  }

  const valid = parsed.data;

  const captchaOk = await verifyHCaptcha(valid.token);
  if (!captchaOk) {
    console.error("hCaptcha verification failed");
    return;
  }

  await prisma.contactMessage.create({
    data: {
      firstName: valid.firstName,
      lastName: valid.lastName,
      email: valid.email,
      phone: valid.phone,
      address: valid.address,
      subject: valid.subject,
      message: valid.message,
      locale: valid.locale === "en" ? "EN" : "FR",
    },
  });

  await sendEmails(valid);
}

export default function ContactPage({ params }: PageProps) {
  const { locale } = params;

  return (
    <div className="pb-16">
      {/* Hero */}
      <section className="bg-gradient-to-b from-neutral-950 via-neutral-900 to-primary/90 py-18 py-16 text-white">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <p className="text-xs uppercase tracking-[0.3em] text-secondary">
            Villa R.E.E.L
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            Contact &amp; demandes
          </h1>
          <p className="mt-3 max-w-xl text-sm text-neutral-200">
            Une question, un projet de séjour, un événement ou un séminaire ?
            Partagez-nous vos envies, nous revenons vers vous rapidement.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-[#f6f7f8] py-14">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 md:flex-row md:px-6">
          {/* Form */}
          <div className="flex-1 rounded-2xl bg-white p-5 shadow-sm md:p-6">
            <form action={submitContact} className="space-y-4 text-xs">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="firstName"
                    className="text-[11px] font-semibold text-neutral-600"
                  >
                    Prénom
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
                  <label
                    htmlFor="lastName"
                    className="text-[11px] font-semibold text-neutral-600"
                  >
                    Nom
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
                  <label
                    htmlFor="phone"
                    className="text-[11px] font-semibold text-neutral-600"
                  >
                    Téléphone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="rounded-lg border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="email"
                    className="text-[11px] font-semibold text-neutral-600"
                  >
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
                <label
                  htmlFor="address"
                  className="text-[11px] font-semibold text-neutral-600"
                >
                  Adresse
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  className="rounded-lg border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="subject"
                  className="text-[11px] font-semibold text-neutral-600"
                >
                  Objet
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  className="rounded-lg border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="">Sélectionnez un objet</option>
                  <option value="sejour">Séjour / location</option>
                  <option value="entreprise">Séminaire / entreprise</option>
                  <option value="evenement">Événement privé</option>
                  <option value="collaboration">Collaboration / tournage</option>
                  <option value="autre">Autre demande</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="message"
                  className="text-[11px] font-semibold text-neutral-600"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  className="rounded-lg border border-neutral-200 px-3 py-2 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Précisez vos dates souhaitées, le nombre de personnes et la nature de votre projet."
                />
              </div>

              <input type="hidden" name="locale" value={locale} />
              {/* hCaptcha invisible : le token sera injecté côté client (intégration JS à ajouter) */}
              <input type="hidden" name="h-captcha-response" />

              <div className="flex items-start gap-2">
                <input
                  id="consent"
                  name="consent"
                  type="checkbox"
                  required
                  className="mt-0.5 h-3 w-3 rounded border-neutral-300 text-primary"
                />
                <label
                  htmlFor="consent"
                  className="text-[10px] text-neutral-600"
                >
                  J&apos;accepte que mes données soient utilisées pour être
                  recontacté(e) dans le cadre de ma demande, conformément à la
                  politique de confidentialité du site.
                </label>
              </div>

              <button
                type="submit"
                className="mt-2 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary px-5 py-2.5 text-xs font-semibold text-white shadow-md transition hover:opacity-90"
              >
                Envoyer ma demande
              </button>
            </form>
          </div>

          {/* Info card */}
          <aside className="w-full md:w-[320px]">
            <div className="rounded-2xl bg-neutral-900 p-5 text-xs text-neutral-100 shadow-md">
              <h2 className="text-sm font-semibold text-white">
                Informations de contact
              </h2>
              <p className="mt-2 text-[11px] text-neutral-300">
                1281 route de Moussy
                <br />
                74930 Reigner-Esery, France
              </p>
              <p className="mt-2 text-[11px] text-neutral-300">
                Email :{" "}
                <a
                  href="mailto:contact@villareel.fr"
                  className="text-secondary hover:text-white"
                >
                  contact@villareel.fr
                </a>
                <br />
                Téléphone :{" "}
                <a
                  href="tel:+33600000000"
                  className="text-secondary hover:text-white"
                >
                  +33 (0)6 00 00 00 00
                </a>
              </p>

              <div className="mt-5 rounded-xl bg-neutral-800 p-4 text-[11px] text-neutral-200">
                <p className="font-semibold">Réserver votre séjour</p>
                <p className="mt-1 text-neutral-300">
                  Consultez les disponibilités et envoyez une demande de
                  réservation directement via notre formulaire dédié.
                </p>
                <a
                  href={`/${locale}/villa`}
                  className="mt-3 inline-flex items-center justify-center rounded-full bg-white px-4 py-1.5 text-[11px] font-semibold text-neutral-900"
                >
                  Découvrir la villa
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

