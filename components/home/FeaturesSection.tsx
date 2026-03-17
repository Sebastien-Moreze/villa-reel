export function FeaturesSection() {
  const features = [
    {
      title: "Piscine chauffée",
      description: "Un bassin turquoise pour se détendre dès le matin.",
      image: "/images/gallery/gallery-piscine-coucher-soleil.jpg",
    },
    {
      title: "Vue Mont-Blanc",
      description: "Panorama unique sur la chaîne alpine depuis la terrasse.",
      image: "/images/gallery/gallery-vue-montagnes.jpg",
    },
    {
      title: "Jardin tropical",
      description: "Palmiers, bananiers et lumières d'ambiance pour vos soirées.",
      image: "/images/gallery/gallery-jardin-palmier.jpg",
    },
    {
      title: "Salle de billard",
      description: "Un espace convivial pour vos soirées entre amis ou collègues.",
      image: "/images/gallery/gallery-salle-billard-tv.jpg",
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
              className="group relative flex h-64 flex-col justify-end overflow-hidden rounded-2xl shadow-md transition hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Photo de fond */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url('${feature.image}')` }}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              {/* Texte */}
              <div className="relative z-10 p-5">
                <h3 className="text-sm font-semibold text-white drop-shadow">
                  {feature.title}
                </h3>
                <p className="mt-1 text-xs text-white/80 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

