"use client";

import Link from "next/link";
import {
  ChevronLeft,
} from "lucide-react";
import { useEffect, useState } from "react";

import type { ShowroomSettingsView } from "@/lib/settings";

const navLinks = [
  ["Accueil", "/#top"],
  ["Catégories", "/categories"],
  ["Stock", "/#inventory"],
  ["Marques", "/#brands"],
  ["Avis", "/avis"],
  ["Donner un avis", "/donner-un-avis"],
  ["Contact", "/#contact"],
];

type PublicHeaderProps = {
  backLink?: {
    href: string;
    label: string;
  };
  settings: ShowroomSettingsView;
  overlay?: boolean;
  sticky?: boolean;
};

export function PublicHeader({
  backLink,
  overlay = false,
  settings,
  sticky = true,
}: PublicHeaderProps) {
  const [hasScrolled, setHasScrolled] = useState(false);
  const logoUrl = settings.websiteLogoUrl || settings.logoUrl;
  const solidHeaderClassName =
    "border-b border-white/10 bg-[#1b1b1b]/72 shadow-xl shadow-black/10 backdrop-blur-xl";

  useEffect(() => {
    if (!overlay) return;

    function updateScrollState() {
      setHasScrolled(window.scrollY > 24);
    }

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });

    return () => window.removeEventListener("scroll", updateScrollState);
  }, [overlay]);

  const headerClassName = overlay
    ? `fixed left-0 top-0 z-50 w-full px-4 text-white transition duration-300 sm:px-8 ${
        hasScrolled
          ? solidHeaderClassName
          : "border-b border-transparent bg-transparent"
      }`
    : `z-40 px-4 text-white ${solidHeaderClassName} sm:px-8 ${
        sticky ? "sticky top-0" : ""
      }`;
  const linkClassName =
    "inline-flex items-center gap-2 text-sm font-semibold text-white/78 transition hover:text-white";
  const navClassName =
    "flex w-full items-center gap-4 overflow-x-auto pb-1 text-sm font-semibold text-white/78 lg:w-auto lg:gap-7 lg:overflow-visible lg:pb-0";

  return (
    <header className={headerClassName}>
      <nav className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-5 py-3">
        <Link className="flex min-w-0 items-center gap-3" href="/" aria-label={settings.companyName}>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={settings.companyName}
              height={settings.logoHeight}
              src={logoUrl}
              style={{
                height: settings.logoHeight,
                maxHeight: 52,
                maxWidth: "min(58vw, 240px)",
                width: settings.logoWidth,
              }}
              width={settings.logoWidth}
              className="block shrink-0 object-contain"
            />
          ) : (
            <span className="text-lg font-semibold tracking-tight">{settings.companyName}</span>
          )}
        </Link>

        {backLink ? (
          <Link
            className={linkClassName}
            href={backLink.href}
          >
            <ChevronLeft className="h-4 w-4" />
            {backLink.label}
          </Link>
        ) : (
          <div className={navClassName}>
            {navLinks.map(([item, href]) => (
              <Link
                className="whitespace-nowrap transition hover:text-white"
                href={href}
                key={item}
              >
                {item}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
