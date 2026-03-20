import React from "react";
import { Resend } from "resend";
import { render } from "@react-email/components";
import { logger } from "@/lib/logger";
import ReservationConfirmationEmail from "@/emails/ReservationConfirmation";
import BalanceReminderEmail from "@/emails/BalanceReminder";
import ReviewRequestEmail from "@/emails/ReviewRequest";

type Locale = "fr" | "en";

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.CONTACT_EMAIL ?? "no-reply@villareel.com";

function getResend() {
  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return new Resend(resendApiKey);
}

async function sendWithRetry(options: {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
  attachments?: { filename: string; content: Buffer | string }[];
}) {
  const resend = getResend();
  const html = await render(options.react);

  const maxAttempts = 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await resend.emails.send({
        from: `Villa R.E.E.L <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html,
        attachments: options.attachments,
      });
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 500));
    }
  }

  logger.error("Failed to send email after retries", {
    module: "lib/emails",
    detail: lastError,
  });
}

export async function sendReservationConfirmationEmail(args: {
  locale: Locale;
  to: string;
  confirmationCode: string;
  checkIn: string;
  checkOut: string;
  villaName: string;
  totalAmount: number;
  depositAmount: number;
  balanceAmount: number;
  balanceDueDate: string;
  houseRulesPdfBase64?: string;
}) {
  const react = React.createElement(ReservationConfirmationEmail, {
    locale: args.locale,
    confirmationCode: args.confirmationCode,
    checkIn: args.checkIn,
    checkOut: args.checkOut,
    villaName: args.villaName,
    totalAmount: args.totalAmount,
    depositAmount: args.depositAmount,
    balanceAmount: args.balanceAmount,
    balanceDueDate: args.balanceDueDate,
  });

  const subject =
    args.locale === "fr"
      ? "Votre réservation Villa R.E.E.L est confirmée !"
      : "Your Villa R.E.E.L reservation is confirmed!";

  const attachments =
    args.houseRulesPdfBase64 != null
      ? [
          {
            filename:
              args.locale === "fr" ? "reglement-interieur.pdf" : "house-rules.pdf",
            content: args.houseRulesPdfBase64,
          },
        ]
      : undefined;

  await sendWithRetry({ to: args.to, subject, react, attachments });
}

export async function sendBalanceReminderEmail(args: {
  locale: Locale;
  to: string;
  confirmationCode: string;
  balanceAmount: number;
  balanceDueDate: string;
  paymentUrl: string;
}) {
  const react = React.createElement(BalanceReminderEmail, {
    locale: args.locale,
    confirmationCode: args.confirmationCode,
    balanceAmount: args.balanceAmount,
    balanceDueDate: args.balanceDueDate,
    paymentUrl: args.paymentUrl,
  });

  const subject =
    args.locale === "fr"
      ? "Rappel : solde de votre réservation à régler"
      : "Reminder: remaining balance for your stay";

  await sendWithRetry({ to: args.to, subject, react });
}

export async function sendReviewRequestEmail(args: {
  locale: Locale;
  to: string;
  guestName: string;
  reviewUrl: string;
}) {
  const react = React.createElement(ReviewRequestEmail, {
    locale: args.locale,
    guestName: args.guestName,
    reviewUrl: args.reviewUrl,
  });

  const subject =
    args.locale === "fr"
      ? "Comment s'est passé votre séjour ?"
      : "How was your stay at Villa R.E.E.L?";

  await sendWithRetry({ to: args.to, subject, react });
}

