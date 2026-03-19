"use server";

import { z } from "zod";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { escapeHtml, escapeHtmlMultiline } from "@/lib/html";

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

async function verifyHCaptcha(token: string): Promise<boolean> {
  const secret = process.env.HCAPTCHA_SECRET;

  // Si pas de secret configuré (dev local), on laisse passer
  if (!secret) {
    console.warn("HCAPTCHA_SECRET non configuré — vérification ignorée");
    return true;
  }

  try {
    const res = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = (await res.json()) as { success?: boolean };
    return !!data.success;
  } catch {
    return false;
  }
}

async function sendEmails(input: z.infer<typeof contactSchema>) {
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
      <li><strong>Nom :</strong> ${escapeHtml(input.firstName)} ${escapeHtml(input.lastName)}</li>
      <li><strong>Email :</strong> ${escapeHtml(input.email)}</li>
      <li><strong>Téléphone :</strong> ${escapeHtml(input.phone ?? "-")}</li>
      <li><strong>Adresse :</strong> ${escapeHtml(input.address ?? "-")}</li>
      <li><strong>Objet :</strong> ${escapeHtml(input.subject)}</li>
    </ul>
    <p><strong>Message :</strong></p>
    <p>${escapeHtmlMultiline(input.message)}</p>
  `;

  const safeName = escapeHtml(input.firstName);
  const guestHtml =
    input.locale === "en"
      ? `<p>Hello ${safeName},</p><p>Thank you for contacting Villa R.E.E.L. We have received your message and will get back to you as soon as possible.</p><p>Best regards,<br/>Villa R.E.E.L</p>`
      : `<p>Bonjour ${safeName},</p><p>Merci pour votre message. Nous l'avons bien reçu et reviendrons vers vous dans les plus brefs délais.</p><p>Cordialement,<br/>Villa R.E.E.L</p>`;

  await Promise.all([
    resend.emails.send({
      from: "Villa R.E.E.L <no-reply@villareel.com>",
      to: [toOwner],
      subject: subjectOwner,
      html: ownerHtml,
    }),
    resend.emails.send({
      from: "Villa R.E.E.L <no-reply@villareel.com>",
      to: [input.email],
      subject: subjectGuest,
      html: guestHtml,
    }),
  ]);
}

export type ContactActionResult =
  | { success: true }
  | { success: false; error: string };

export async function submitContact(
  formData: FormData,
): Promise<ContactActionResult> {
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
    return { success: false, error: "Formulaire invalide. Vérifiez vos informations." };
  }

  const valid = parsed.data;

  const captchaOk = await verifyHCaptcha(valid.token);
  if (!captchaOk) {
    return { success: false, error: "Vérification anti-spam échouée. Veuillez réessayer." };
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

  return { success: true };
}
