/**
 * Liste des photos de la galerie (public/images/gallery/).
 * Utilisée sur l'accueil et la page Galerie.
 */
export type GalleryPhoto = {
  id: number;
  src: string;
  alt: string;
};

const BASE = "/images/gallery";

export const GALLERY_PHOTOS: GalleryPhoto[] = [
  { id: 1, src: `${BASE}/gallery-piscine-vue-maison.jpg`, alt: "Piscine et vue sur la maison" },
  { id: 2, src: `${BASE}/gallery-salon-panoramique.jpg`, alt: "Salon panoramique" },
  { id: 3, src: `${BASE}/gallery-suite-master.jpg`, alt: "Suite master" },
  { id: 4, src: `${BASE}/gallery-terrasse-rooftop-salon.jpg`, alt: "Terrasse rooftop salon" },
  { id: 5, src: `${BASE}/gallery-jardin-palmier.jpg`, alt: "Jardin tropical et palmier" },
  { id: 6, src: `${BASE}/gallery-salon-double-hauteur.jpg`, alt: "Salon double hauteur" },
  { id: 7, src: `${BASE}/gallery-salle-manger-ouverte.jpg`, alt: "Salle à manger ouverte" },
  { id: 8, src: `${BASE}/gallery-salle-billard-tv.jpg`, alt: "Salle de billard et TV" },
  { id: 9, src: `${BASE}/gallery-cuisine-ouverte.jpg`, alt: "Cuisine ouverte" },
  { id: 10, src: `${BASE}/gallery-suite-master-sdb.jpg`, alt: "Suite master, salle de bain" },
  { id: 11, src: `${BASE}/gallery-terrasse-rooftop-sport.jpg`, alt: "Terrasse rooftop sport" },
  { id: 12, src: `${BASE}/gallery-salon-exterieur-pergola.jpg`, alt: "Salon extérieur sous pergola" },
  { id: 13, src: `${BASE}/gallery-salle-manger-ronde.jpg`, alt: "Salle à manger ronde" },
  { id: 14, src: `${BASE}/gallery-grand-sejour.jpg`, alt: "Grand séjour" },
  { id: 15, src: `${BASE}/gallery-piscine-pergola-01.jpg`, alt: "Piscine et pergola" },
  { id: 16, src: `${BASE}/gallery-piscine-pergola-02.jpg`, alt: "Piscine et pergola (2)" },
  { id: 17, src: `${BASE}/gallery-piscine-coucher-soleil.jpg`, alt: "Piscine au coucher du soleil" },
  { id: 18, src: `${BASE}/gallery-piscine-nuit.jpg`, alt: "Piscine de nuit" },
  { id: 19, src: `${BASE}/gallery-piscine-palmier-01.jpg`, alt: "Piscine et palmier" },
  { id: 20, src: `${BASE}/gallery-piscine-palmier-02.jpg`, alt: "Piscine et palmier (2)" },
  { id: 21, src: `${BASE}/gallery-piscine-arriere.jpg`, alt: "Piscine vue arrière" },
  { id: 22, src: `${BASE}/gallery-balcon-vue-piscine.jpg`, alt: "Balcon avec vue sur la piscine" },
  { id: 23, src: `${BASE}/gallery-vue-montagnes.jpg`, alt: "Vue sur les montagnes" },
  { id: 24, src: `${BASE}/gallery-chambre-01.jpg`, alt: "Chambre 1" },
  { id: 25, src: `${BASE}/gallery-chambre-02.jpg`, alt: "Chambre 2" },
  { id: 26, src: `${BASE}/gallery-chambre-03.jpg`, alt: "Chambre 3" },
  { id: 27, src: `${BASE}/gallery-chambre-04.jpg`, alt: "Chambre 4" },
  { id: 28, src: `${BASE}/gallery-chambre-05.jpg`, alt: "Chambre 5" },
  { id: 29, src: `${BASE}/gallery-chambre-loft-01.jpg`, alt: "Chambre loft 1" },
  { id: 30, src: `${BASE}/gallery-chambre-loft-02.jpg`, alt: "Chambre loft 2" },
  { id: 31, src: `${BASE}/gallery-chambre-loft-familiale.jpg`, alt: "Chambre loft familiale" },
  { id: 32, src: `${BASE}/gallery-salle-bain-master.jpg`, alt: "Salle de bain master" },
  { id: 33, src: `${BASE}/gallery-salle-bain-mansardee-01.jpg`, alt: "Salle de bain mansardée 1" },
  { id: 34, src: `${BASE}/gallery-salle-bain-mansardee-02.jpg`, alt: "Salle de bain mansardée 2" },
  { id: 35, src: `${BASE}/gallery-dressing.jpg`, alt: "Dressing" },
  { id: 36, src: `${BASE}/gallery-cuisine-ilot-bar.jpg`, alt: "Cuisine avec îlot et bar" },
  { id: 37, src: `${BASE}/gallery-escalier-verre.jpg`, alt: "Escalier verre" },
  { id: 38, src: `${BASE}/gallery-escalier-colimacon.jpg`, alt: "Escalier colimaçon" },
  { id: 39, src: `${BASE}/gallery-palier-loft.jpg`, alt: "Palier loft" },
  { id: 40, src: `${BASE}/gallery-palier-luminaires.jpg`, alt: "Palier et luminaires" },
  { id: 41, src: `${BASE}/gallery-wc-rdc.jpg`, alt: "WC rez-de-chaussée" },
  { id: 42, src: `${BASE}/gallery-wc-loft.jpg`, alt: "WC loft" },
  { id: 43, src: `${BASE}/gallery-jardin-jeux-enfants-01.jpg`, alt: "Jardin et espace jeux enfants 1" },
  { id: 44, src: `${BASE}/gallery-jardin-jeux-enfants-02.jpg`, alt: "Jardin et espace jeux enfants 2" },
  { id: 45, src: `${BASE}/gallery-abri-jardin.jpg`, alt: "Abri de jardin" },
  { id: 46, src: `${BASE}/gallery-borne-recharge-clim.jpg`, alt: "Borne de recharge et climatisation" },
];

/** Nombre de photos affichées sur l'accueil (1 grande + N petites) */
export const HOME_GALLERY_COUNT = 12;
