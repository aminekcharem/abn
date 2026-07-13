"use client";

import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";

type MobileNavLink = {
  children?: MobileNavLink[];
  href: string;
  label: string;
};

type PublicMobileMenuProps = {
  links: MobileNavLink[];
};

export function PublicMobileMenu({ links }: PublicMobileMenuProps) {
  const [open, setOpen] = useState(false);
  const [openParent, setOpenParent] = useState<string | null>(null);

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
          {links.map((link) => {
            const isParentOpen = openParent === link.href;

            if (link.children?.length) {
              return (
                <div key={link.href}>
                  <button
                    aria-expanded={isParentOpen}
                    className="flex min-h-11 w-full items-center justify-between gap-3 rounded-md px-4 py-3 text-left text-sm font-semibold text-white/82 transition hover:bg-white/10 hover:text-white"
                    onClick={() =>
                      setOpenParent((current) => (current === link.href ? null : link.href))
                    }
                    type="button"
                  >
                    <span>{link.label}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition ${isParentOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isParentOpen ? (
                    <div className="mb-1 ml-3 border-l border-white/10 pl-2">
                      {link.children.map((child) => (
                        <Link
                          className="flex min-h-10 items-center rounded-md px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
                          href={child.href}
                          key={child.href}
                          onClick={() => setOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            }

            return (
              <Link
                className="flex min-h-11 items-center rounded-md px-4 py-3 text-sm font-semibold text-white/82 transition hover:bg-white/10 hover:text-white"
                href={link.href}
                key={link.href}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
