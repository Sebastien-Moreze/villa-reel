import { redirect } from "next/navigation";

/**
 * Route racine "/" — redirige vers la homepage francophone.
 * Le middleware next-intl gère aussi cette redirection, mais cette
 * page sert de fallback propre si le middleware ne s'exécute pas.
 */
export default function RootPage() {
  redirect("/fr");
}
