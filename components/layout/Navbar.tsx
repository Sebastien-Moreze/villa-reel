'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

const NAV_LINKS = [
  { href: "", label: "Accueil" },
  { href: "/villa", label: "La Villa" },
  { href: "/galerie", label: "Galerie" },
  { href: "/entreprises", label: "Entreprises" },
  { href: "/evenements", label: "Événements" },
  { href: "/collaborateurs", label: "Collaborateurs" },
  { href: "/contact", label: "Contact" },
];

type Props = {
  locale: string;
};

export function Navbar({ locale }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const buildHref = (path: string) => {
    const base = `/${locale}`;
    if (!path) return base;
    return `${base}${path}`;
  };

  const isActive = (path: string) => {
    const target = buildHref(path);
    return pathname === target;
  };

  const switchLocale = (nextLocale: string) => {
    const segments = pathname.split("/");
    segments[1] = nextLocale;
    const nextPath = segments.join("/") || "/";
    router.push(nextPath);
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-shadow ${
          scrolled ? "bg-white/95 shadow-md backdrop-blur" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <Link href={buildHref("")} className="flex items-center gap-2">
            <div className="rounded-full bg-gradient-to-r from-primary to-secondary px-4 py-1">
              <span className="text-xs font-semibold tracking-[0.25em] text-white">
                VILLA
              </span>
            </div>
            <span className="font-display font-semibold tracking-[0.35em] text-sm text-primary md:text-base">
              R.E.E.L
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-neutral-700 md:flex">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href || "home"}
                href={buildHref(item.href)}
                className={`transition-colors ${
                  isActive(item.href)
                    ? "text-primary"
                    : "hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            <LanguageSwitcher />

            <Link
              href={buildHref("/reservation")}
              className="sticky top-2 rounded-full bg-cta px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
            >
              Réserver
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-primary/30 bg-white/80 p-2 text-primary shadow-sm transition hover:bg-primary/10 md:hidden"
            aria-label="Open menu"
            onClick={() => setOpen((prev) => !prev)}
          >
            <span
              className={`block h-0.5 w-5 transform rounded-full bg-current transition ${
                open ? "translate-y-1.5 rotate-45" : ""
              }`}
            />
            <span
              className={`mt-1 block h-0.5 w-5 transform rounded-full bg-current transition ${
                open ? "-translate-y-1.5 -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </header>

      {/* Drawer mobile */}
      <div
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
      >
        <div
          className={`absolute right-0 top-0 h-full w-72 max-w-[80%] bg-white p-5 shadow-xl transition-transform ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-6 flex items-center justify-between">
            <span className="font-display text-sm font-semibold tracking-[0.25em] text-primary">
              VILLA R.E.E.L
            </span>
            <button
              type="button"
              className="rounded-full border border-neutral-200 p-1"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <span className="block h-4 w-4 rotate-45 border-r-2 border-t-2 border-neutral-700" />
            </button>
          </div>

          <nav className="flex flex-col gap-4 text-sm font-medium text-neutral-800">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href || "home"}
                href={buildHref(item.href)}
                className={`rounded-md px-1 py-1 ${
                  isActive(item.href)
                    ? "text-primary"
                    : "hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-6 flex items-center justify-between">
            <LanguageSwitcher />
            <Link
              href={buildHref("/reservation")}
              className="rounded-full bg-cta px-4 py-2 text-xs font-semibold text-white shadow-md"
            >
              Réserver
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

