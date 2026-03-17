import { Resend } from "resend";
import { render } from "@react-email/components";
import ReservationConfirmationEmail from "@/emails/ReservationConfirmation";
import BalanceReminderEmail from "@/emails/BalanceReminder";
import ArrivalReminderEmail from "@/emails/ArrivalReminder";
import ReviewRequestEmail from "@/emails/ReviewRequest";
import ContactConfirmationEmail from "@/emails/ContactConfirmation";
import ContactNotificationEmail from "@/emails/ContactNotification";

type Locale = "fr" | "en";

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.CONTACT_EMAIL ?? "no-reply@villareel.fr";

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
      // simple backoff
      await new Promise((resolve) =>
        setTimeout(resolve, attempt * 500),
      );
    }
  }

  // eslint-disable-next-line no-console
  console.error("Failed to send email after retries", lastError);
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
  const react = (
    <ReservationConfirmationEmail
      locale={args.locale}
      confirmationCode={args.confirmationCode}
      checkIn={args.checkIn}
      checkOut={args.checkOut}
      villaName={args.villaName}
      totalAmount={args.totalAmount}
      depositAmount={args.depositAmount}
      balanceAmount={args.balanceAmount}
      balanceDueDate={args.balanceDueDate}
    />
  );

  const subject =
    args.locale === "fr"
      ? "Votre réservation Villa R.E.E.L est confirmée !"
      : "Your Villa R.E.E.L reservation is confirmed!";

  const attachments =
    args.houseRulesPdfBase64 != null
      ? [
          {
            filename:
              args.locale === "fr"
                ? "reglement-interieur.pdf"
                : "house-rules.pdf",
            content: args.houseRulesPdfBase64,
          },
        ]
      : undefined;

  await sendWithRetry({
    to: args.to,
    subject,
    react,
    attachments,
  });
}

export async function sendBalanceReminderEmail(args: {
  locale: Locale;
  to: string;
  confirmationCode: string;
  balanceAmount: number;
  balanceDueDate: string;
  paymentUrl: string;
}) {
  const react = (
    <BalanceReminderEmail
      locale={args.locale}
      confirmationCode={args.confirmationCode}
      balanceAmount={args.balanceAmount}
      balanceDueDate={args.balanceDueDate}
      paymentUrl={args.paymentUrl}
    />
  );

  const subject =
    args.locale === "fr"
      ? "Rappel : solde de votre réservation à régler"
      : "Reminder: remaining balance for your stay";

  await sendWithRetry({
    to: args.to,
    subject,
    react,
  });
}

export async function sendArrivalReminderEmail(args: {
  locale: Locale;
  to: string;
  confirmationCode: string;
  checkIn: string;
  portalCode?: string;
  wifiName?: string;
  wifiPassword?: string;
  contactPhone?: string;
  contactEmail?: string;
}) {
  const react = (
    <ArrivalReminderEmail
      locale={args.locale}
      confirmationCode={args.confirmationCode}
      checkIn={args.checkIn}
      portalCode={args.portalCode}
      wifiName={args.wifiName}
      wifiPassword={args.wifiPassword}
      contactPhone={args.contactPhone}
      contactEmail={args.contactEmail}
    />
  );

  const subject =
    args.locale === "fr"
      ? "Votre séjour commence dans 7 jours !"
      : "Your stay starts in 7 days!";

  await sendWithRetry({
    to: args.to,
    subject,
    react,
  });
}

export async function sendReviewRequestEmail(args: {
  locale: Locale;
  to: string;
  guestName: string;
  reviewUrl: string;
}) {
  const react = (
    <ReviewRequestEmail
      locale={args.locale}
      guestName={args.guestName}
      reviewUrl={args.reviewUrl}
    />
  );

  const subject =
    args.locale === "fr"
      ? "Comment s'est passé votre séjour ?"
      : "How was your stay at Villa R.E.E.L?";

  await sendWithRetry({
    to: args.to,
    subject,
    react,
  });
}

export async function sendContactConfirmationEmail(args: {
  locale: Locale;
  to: string;
  firstName: string;
}) {
  const react = (
    <ContactConfirmationEmail
      locale={args.locale}
      firstName={args.firstName}
    />
  );

  const subject =
    args.locale === "fr"
      ? "Nous avons bien reçu votre message"
      : "We have received your message";

  await sendWithRetry({
    to: args.to,
    subject,
    react,
  });
}

export async function sendContactNotificationEmail(args: {
  locale: Locale;
  to: string | string[];
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  const react = (
    <ContactNotificationEmail
      locale={args.locale}
      firstName={args.firstName}
      lastName={args.lastName}
      email={args.email}
      phone={args.phone}
      subject={args.subject}
      message={args.message}
    />
  );

  const subject =
    args.locale === "fr"
      ? "Nouveau message de contact – Villa R.E.E.L"
      : "New contact message – Villa R.E.E.L";

  await sendWithRetry({
    to: args.to,
    subject,
    react,
  });
}

