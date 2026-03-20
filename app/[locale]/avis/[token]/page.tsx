import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ReviewForm } from "./ReviewForm";

type PageProps = {
  params: Promise<{ locale: string; token: string }>;
};

export default async function ReviewPage({ params }: PageProps) {
  const { locale, token } = await params;

  /* Vérifier que le token est valide */
  const reservation = await prisma.reservation.findUnique({
    where: { reviewToken: token },
    select: {
      id: true,
      guestName: true,
      checkIn: true,
      checkOut: true,
      status: true,
      reviewToken: true,
      review: { select: { id: true } },
    },
  });

  if (!reservation || reservation.review) {
    notFound();
  }

  const isFr = locale === "fr";

  return (
    <main className="min-h-screen bg-background py-16">
      <div className="mx-auto max-w-2xl px-4">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
            Villa R.E.E.L
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-neutral-900 md:text-3xl">
            {isFr
              ? "Comment s'est passé votre séjour ?"
              : "How was your stay?"}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            {isFr
              ? `Merci ${reservation.guestName.split(" ")[0]}, votre avis nous aide à nous améliorer.`
              : `Thank you ${reservation.guestName.split(" ")[0]}, your feedback helps us improve.`}
          </p>
        </div>

        <ReviewForm token={token} locale={locale} />
      </div>
    </main>
  );
}
