"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyHoneypot } from "@/lib/honeypot";
import {
  sendContactNotificationEmail,
  sendContactConfirmationEmail,
} from "@/lib/emails";
import { logger } from "@/lib/logger";

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
  token: z.string(),
  website: z.string().optional(),
});

async function sendEmails(input: z.infer<typeof contactSchema>) {
  const toOwner = process.env.CONTACT_EMAIL;
  if (!toOwner) return;

  try {
    await Promise.all([
      sendContactNotificationEmail({
        locale: input.locale,
        to: toOwner,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        subject: input.subject,
        message: input.message,
      }),
      sendContactConfirmationEmail({
        locale: input.locale,
        to: input.email,
        firstName: input.firstName,
      }),
    ]);
  } catch (error) {
    logger.error("Failed to send contact emails", {
      module: "contact/actions",
      detail: error,
    });
  }
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
    website: formData.get("website") as string | null || undefined,
  };

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: "Formulaire invalide. Vérifiez vos informations." };
  }

  const valid = parsed.data;

  const honeypotOk = verifyHoneypot(valid.website);
  if (!honeypotOk) {
    return { success: false, error: "Formulaire invalide." };
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
