export function FeaturesSection() {
  const features = [
    {
      title: "Piscine chauffée",
      description: "Un bassin turquoise pour se détendre dès le matin.",
    },
    {
      title: "Vue Mont-Blanc",
      description: "Panorama unique sur la chaîne alpine depuis la terrasse.",
    },
    {
      title: "Jardin tropical",
      description: "Palmiers, bananiers et lumières d'ambiance pour vos soirées.",
    },
    {
      title: "Salle de billard",
      description: "Un espace convivial pour vos soirées entre amis ou collègues.",
    },
  ];

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <h2 className="font-display text-center text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Expérience Villa R.E.E.L
        </h2>
        <p className="font-display mt-2 text-center text-2xl font-semibold text-neutral-900 md:text-3xl">
          Entre élégance alpine et atmosphère tropicale
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group flex h-full flex-col rounded-2xl border border-primary/10 bg-primary/5 p-5 text-sm text-neutral-800 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                {/* Simple monogram icon */}
                {feature.title.substring(0, 2)}
              </div>
              <h3 className="text-sm font-semibold text-neutral-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-xs text-neutral-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

