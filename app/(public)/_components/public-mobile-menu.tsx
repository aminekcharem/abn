"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

type MobileNavLink = {
  href: string;
  label: string;
};

type PublicMobileMenuProps = {
  links: MobileNavLink[];
};

export function PublicMobileMenu({ links }: PublicMobileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative z-[300] lg:hidden">
      <button
        aria-expanded={open}
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/20 bg-white/10 text-white transition hover:bg-white/15"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open ? (
        <div className="fixed left-4 right-4 top-[74px] z-[300] max-h-[calc(100vh-92px)] overflow-y-auto rounded-md border border-white/10 bg-[#14181d] p-2 text-white shadow-2xl shadow-black/45 sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-[min(82vw,320px)]">
          {links.map((link) => (
            <Link
              className="flex min-h-11 items-center rounded-md px-4 py-3 text-sm font-semibold text-white/82 transition hover:bg-white/10 hover:text-white"
              href={link.href}
              key={link.href}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
