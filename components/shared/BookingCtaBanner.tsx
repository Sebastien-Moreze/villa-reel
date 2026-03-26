import Link from "next/link";

type BookingCtaBannerProps = {
  locale: string;
  title: string;
  desc: string;
  btn: string;
};

export function BookingCtaBanner({ locale, title, desc, btn }: BookingCtaBannerProps) {
  return (
    <section className="bg-gradient-to-r from-primary to-secondary py-12">
      <div className="mx-auto max-w-4xl px-4 text-center md:px-6">
        <h2 className="text-xl font-semibold text-white md:text-2xl">
          {title}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/90">
          {desc}
        </p>
        <Link
          href={`/${locale}/reservation`}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-cta px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl"
        >
          {btn}
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}
