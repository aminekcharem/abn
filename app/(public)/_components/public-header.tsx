"use client";

import Link from "next/link";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";

import { PublicLanguageSwitch } from "./public-language-switch";
import { PublicMobileMenu } from "./public-mobile-menu";
import type { PublicBrandLink } from "@/lib/public-navigation";
import type { ShowroomSettingsView } from "@/lib/settings";

const navLinks = [
  ["Accueil", "/#top"],
  ["Marques", "/marques"],
  ["Avis", "/avis"],
  ["Donner un avis", "/donner-un-avis"],
  ["Contact", "/#contact"],
];

const mobileNavLinks = navLinks.map(([label, href]) => ({ href, label }));

type PublicHeaderProps = {
  backLink?: {
    href: string;
    label: string;
  };
  brandLinks?: PublicBrandLink[];
  settings: ShowroomSettingsView;
  overlay?: boolean;
  sticky?: boolean;
};

export function PublicHeader({
  backLink,
  brandLinks = [],
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
    ? `fixed left-0 top-0 z-[280] w-full px-4 text-white transition duration-300 sm:px-8 ${
        hasScrolled
          ? solidHeaderClassName
          : "border-b border-transparent bg-transparent"
      }`
    : `z-[280] px-4 text-white ${solidHeaderClassName} sm:px-8 ${
        sticky ? "sticky top-0" : "relative"
      }`;
  const linkClassName =
    "inline-flex items-center gap-2 text-sm font-semibold text-white/78 transition hover:text-white";
  const navClassName =
    "hidden items-center gap-7 text-sm font-semibold text-white/78 lg:flex";
  const mobileLinks = brandLinks.length
    ? navLinks.map(([label, href]) =>
        label === "Marques"
          ? {
              children: [
                { href, label: "Toutes les marques" },
                ...brandLinks.map((brand) => ({
                  href: brand.href,
                  label: brand.label,
                })),
              ],
              href,
              label,
            }
          : { href, label },
      )
    : mobileNavLinks;

  return (
    <header className={headerClassName}>
      <nav className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 py-3">
        <Link className="flex min-w-0 items-center gap-3" href="/" aria-label={settings.companyName}>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={settings.companyName}
              className="block shrink-0 object-contain"
              height={settings.logoHeight}
              src={logoUrl}
              style={{
                height: settings.logoHeight,
                maxHeight: 52,
                maxWidth: "min(58vw, 240px)",
                width: settings.logoWidth,
              }}
              width={settings.logoWidth}
            />
          ) : (
            <span className="text-lg font-semibold tracking-tight">{settings.companyName}</span>
          )}
        </Link>

        <div className="flex items-center gap-3">
          {backLink ? (
            <Link
              className={`${linkClassName} hidden sm:inline-flex`}
              href={backLink.href}
            >
              <ChevronLeft className="h-4 w-4" />
              {backLink.label}
            </Link>
          ) : (
            <div className={navClassName}>
              {navLinks.map(([item, href]) => (
                item === "Marques" ? (
                  <div className="group relative" key={item}>
                    <Link
                      className="inline-flex items-center gap-1 whitespace-nowrap transition hover:text-white"
                      href={href}
                    >
                      {item}
                      <ChevronDown className="h-3.5 w-3.5 transition group-hover:rotate-180" />
                    </Link>
                    {brandLinks.length ? (
                      <div className="invisible absolute left-1/2 top-full z-[320] w-64 -translate-x-1/2 pt-3 opacity-0 transition duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                        <div className="rounded-md border border-white/10 bg-[#14181d] p-2 shadow-2xl shadow-black/35">
                          {brandLinks.map((brand) => (
                            <Link
                              className="flex min-h-10 items-center justify-between gap-3 rounded-md px-3 py-2 text-sm text-white/82 transition hover:bg-white/10 hover:text-white"
                              href={brand.href}
                              key={brand.href}
                            >
                              <span className="truncate">{brand.label}</span>
                              <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/62">
                                {brand.vehicleCount}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <Link
                    className="whitespace-nowrap transition hover:text-white"
                    href={href}
                    key={item}
                  >
                    {item}
                  </Link>
                )
              ))}
            </div>
          )}
          <PublicLanguageSwitch />
          <PublicMobileMenu links={mobileLinks} />
        </div>
      </nav>
    </header>
  );
}
