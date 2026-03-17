import { ContactForm } from "@/components/contact/ContactForm";

type PageProps = {
  params: { locale: string };
};

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
            <ContactForm locale={locale} />
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
