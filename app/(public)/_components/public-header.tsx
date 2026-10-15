"use client";

import Link from "next/link";
import { ChevronDown, Phone, Search } from "lucide-react";

import { PublicLanguageSwitch } from "./public-language-switch";
import { PublicMobileMenu } from "./public-mobile-menu";
import type { PublicBrandLink } from "@/lib/public-navigation";
import type { ShowroomSettingsView } from "@/lib/settings";

const navLinks = [
  { href: "/#top", label: "Accueil" },
  { href: "/marques", label: "Marques" },
  { href: "/categories", label: "Categories" },
  { href: "/avis", label: "Avis" },
  { href: "/#contact", label: "Contact" },
];

type PublicHeaderProps = {
  brandLinks?: PublicBrandLink[];
  settings: ShowroomSettingsView;
  sticky?: boolean;
};

function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function PublicHeader({
  brandLinks = [],
  settings,
  sticky = true,
}: PublicHeaderProps) {
  const logoUrl = settings.logoUrl || settings.websiteLogoUrl;
  const mobileLinks = brandLinks.length
    ? navLinks.map((link) =>
        link.label === "Marques"
          ? {
              children: [
                { href: link.href, label: "Toutes les marques" },
                ...brandLinks.map((brand) => ({
                  href: brand.href,
                  label: brand.label,
                })),
              ],
              href: link.href,
              label: link.label,
            }
          : link,
      )
    : navLinks;
  const headerClassName = `${
    sticky ? "sticky top-0" : "relative"
  } z-[280] border-b border-[#ececec] bg-white/96 text-[#24272c] shadow-[0_8px_28px_rgba(20,24,29,0.06)] backdrop-blur`;

  return (
    <header className={headerClassName}>
      <div className="mx-auto grid min-h-[86px] max-w-[1864px] grid-cols-[auto_1fr_auto] items-center gap-5 px-4 py-3 sm:px-8 xl:px-12">
        <Link className="flex min-w-[150px] items-center gap-3 xl:min-w-[220px]" href="/" aria-label={settings.companyName}>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={settings.companyName}
              className="block object-contain"
              height={settings.logoHeight}
              src={logoUrl}
              style={{
                height: settings.logoHeight,
                maxHeight: 54,
                maxWidth: "min(52vw, 184px)",
                width: settings.logoWidth,
              }}
              width={settings.logoWidth}
            />
          ) : (
            <span className="text-xl font-bold uppercase">{settings.companyName}</span>
          )}
        </Link>

        <nav className="hidden items-center justify-center gap-8 text-[15px] font-semibold leading-5 lg:flex">
          <Link className="inline-flex min-h-[58px] items-center text-[#a21d2f]" href="/#top">Accueil</Link>
          <div className="group relative">
            <Link className="inline-flex min-h-[58px] items-center gap-1 transition hover:text-[#a21d2f]" href="/marques">
              Marques
              <ChevronDown className="h-3.5 w-3.5 transition group-hover:rotate-180" />
            </Link>
            {brandLinks.length ? (
              <div className="invisible absolute left-1/2 top-full z-[320] w-72 -translate-x-1/2 pt-3 opacity-0 transition duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div className="rounded-md border border-[#ededed] bg-white p-2 shadow-[0_20px_45px_rgba(36,39,44,0.12)]">
                  {brandLinks.map((brand) => (
                    <Link
                      className="flex min-h-10 items-center justify-between gap-3 rounded-md px-4 py-2.5 text-sm text-[#696665] transition hover:bg-[#f6f6f6] hover:text-[#a21d2f]"
                      href={brand.href}
                      key={brand.href}
                    >
                      <span className="truncate">{brand.label}</span>
                      <span className="shrink-0 rounded-full bg-[#f2f2f2] px-2 py-0.5 text-[11px] text-[#696665]">
                        {brand.vehicleCount}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <div className="group relative">
            <Link className="inline-flex min-h-[58px] items-center gap-1 transition hover:text-[#a21d2f]" href="/categories">
              Explorer
              <ChevronDown className="h-3.5 w-3.5 transition group-hover:rotate-180" />
            </Link>
            <div className="invisible absolute left-1/2 top-full z-[320] w-56 -translate-x-1/2 pt-3 opacity-0 transition duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="rounded-md border border-[#ededed] bg-white p-2 shadow-[0_20px_45px_rgba(36,39,44,0.12)]">
                <Link className="block rounded-md px-4 py-3 text-sm text-[#24272c] hover:bg-[#f6f6f6] hover:text-[#a21d2f]" href="/categories">
                  Categories
                </Link>
                <Link className="block rounded-md px-4 py-3 text-sm text-[#24272c] hover:bg-[#f6f6f6] hover:text-[#a21d2f]" href="/avis">
                  Avis
                </Link>
                <Link className="block rounded-md px-4 py-3 text-sm text-[#24272c] hover:bg-[#f6f6f6] hover:text-[#a21d2f]" href="/donner-un-avis">
                  Donner un avis
                </Link>
              </div>
            </div>
          </div>
          <Link className="inline-flex min-h-[58px] items-center transition hover:text-[#a21d2f]" href="/#contact">Contact</Link>
        </nav>

        <div className="flex min-w-0 items-center justify-end gap-4 xl:min-w-[300px]">
          <Link
            aria-label="Search"
            className="hidden h-11 w-11 items-center justify-center rounded-full border border-[#ededed] text-[#24272c] transition hover:border-[#a21d2f] hover:text-[#a21d2f] md:inline-flex"
            href="/#vehicules"
          >
            <Search className="h-5 w-5" />
          </Link>
          <a
            className="hidden items-center gap-2 text-sm font-semibold text-[#24272c] transition hover:text-[#a21d2f] xl:inline-flex"
            href={phoneHref(settings.contactPhone)}
          >
            <Phone className="h-5 w-5" />
            {settings.contactPhone}
          </a>
          <PublicLanguageSwitch variant="light" />
          <PublicMobileMenu links={mobileLinks} variant="light" />
        </div>
      </div>
    </header>
  );
}
