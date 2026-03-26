'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/reservations", label: "Réservations" },
  { href: "/admin/calendar", label: "Calendrier" },
  { href: "/admin/reviews", label: "Avis" },
  { href: "/admin/promotions", label: "Promotions" },
  { href: "/admin/amenities", label: "Équipements" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/content", label: "Contenu" },
  { href: "/admin/settings", label: "Paramètres" },
];

type Props = {
  children: React.ReactNode;
  userEmail?: string | null;
};

export function AdminShell({ children, userEmail }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="flex min-h-screen bg-[#0b0b0b] text-neutral-100">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-60 bg-[#1A1A1A] transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex h-16 items-center border-b border-neutral-800 px-4">
          <Link href="/admin/dashboard" className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold tracking-[0.35em] text-primary">
              VILLA
            </span>
            <span className="text-[11px] font-semibold tracking-[0.4em] text-secondary">
              R.E.E.L
            </span>
          </Link>
        </div>
        <nav className="mt-4 flex flex-col gap-1 px-2 text-xs">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center rounded-full px-3 py-2 transition ${
                isActive(item.href)
                  ? "bg-primary text-white"
                  : "text-neutral-300 hover:bg-neutral-800"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex min-h-screen flex-1 flex-col md:pl-60">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-neutral-800 bg-[#111111] px-4 md:px-6">
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 text-neutral-300 md:hidden"
            onClick={() => setOpen((o) => !o)}
          >
            ☰
          </button>
          <div className="text-xs text-neutral-400">
            Interface administrateur Villa R.E.E.L
          </div>
          <div className="flex items-center gap-3 text-[11px] text-neutral-200">
            {userEmail && (
              <span className="hidden sm:inline text-neutral-400">
                {userEmail}
              </span>
            )}
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="rounded-full border border-neutral-600 px-3 py-1 text-[11px] font-semibold text-neutral-100 hover:bg-neutral-800"
            >
              Déconnexion
            </button>
          </div>
        </header>

        <main className="flex-1 bg-[#050505] pb-10 pt-6 text-xs text-neutral-100">
          {children}
        </main>
      </div>
    </div>
  );
}

