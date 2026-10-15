import { unstable_cache } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { faFacebookF, faInstagram } from "@fortawesome/free-brands-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  ArrowRight,
  Building2,
  CarFront,
  MessageSquareText,
  Phone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { FontAwesomeBrandIcon } from "./fontawesome-brand-icon";
import { getMediaUrl } from "@/lib/cdn";
import { getPrisma } from "@/lib/prisma";
import type { ShowroomSettingsView } from "@/lib/settings";

const footerColumns = [
  {
    heading: "À propos ABN",
    id: "about",
    links: [
      { href: "/#top", label: "À propos" },
      { href: "/avis", label: "Avis clients" },
      { href: "/donner-un-avis", label: "Donner un avis" },
      { href: "/#contact", label: "Contact" },
    ],
  },
  {
    heading: "Recherche et exploration",
    id: "explore",
    links: [
      { href: "/#vehicules", label: "Nouveaux vehicules" },
      { href: "/#vehicules", label: "Vehicules disponibles" },
      { href: "/#vehicules", label: "Vehicules pour vous" },
      { href: "/marques", label: "Marques" },
      { href: "/categories", label: "Catégories" },
    ],
  },
];

const fallbackBodyTypes = ["SUV", "Berline", "Citadine", "Coupé", "Hybride", "Électrique"];

type PublicFooterProps = {
  settings: ShowroomSettingsView;
};

type FooterBrand = {
  href: string;
  id: string;
  logo: string | null;
  name: string;
  vehicleCount: number;
};

type FooterCategory = {
  href: string;
  id: string;
  name: string;
};

async function readFooterBrands(): Promise<FooterBrand[]> {
  try {
    const prisma = getPrisma();
    const brands = await prisma.brand.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        logo: true,
        name: true,
        slug: true,
        _count: {
          select: {
            vehicles: {
              where: { status: { not: "BROUILLON" } },
            },
          },
        },
      },
      take: 6,
      where: {
        isActive: true,
        vehicles: {
          some: { status: { not: "BROUILLON" } },
        },
      },
    });

    return brands.map((brand) => ({
      href: `/marques/${brand.slug}`,
      id: brand.id,
      logo: brand.logo,
      name: brand.name,
      vehicleCount: brand._count.vehicles,
    }));
  } catch {
    return [];
  }
}

async function readFooterCategories(): Promise<FooterCategory[]> {
  try {
    const prisma = getPrisma();
    const categories = await prisma.category.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
      },
      take: 7,
      where: {
        isActive: true,
        showOnCategoriesPage: true,
      },
    });

    return categories.map((category) => ({
      href: `/categories#${category.slug}`,
      id: category.id,
      name: category.name,
    }));
  } catch {
    return [];
  }
}

const getFooterBrands = unstable_cache(readFooterBrands, ["footer-brands"], {
  revalidate: 300,
  tags: ["public-brand-links"],
});

const getFooterCategories = unstable_cache(
  readFooterCategories,
  ["footer-categories"],
  {
    revalidate: 300,
    tags: ["footer-categories"],
  },
);

function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function vehicleCountLabel(count: number) {
  return count > 1 ? "voitures" : "voiture";
}

export async function PublicFooter({ settings }: PublicFooterProps) {
  const [brands, categories] = await Promise.all([
    getFooterBrands(),
    getFooterCategories(),
  ]);
  const logoUrl = settings.websiteLogoUrl || settings.logoUrl;
  const socialLinks = [
    settings.facebookUrl
      ? {
          brandIcon: faFacebookF,
          href: settings.facebookUrl,
          label: "Facebook",
        }
      : null,
    settings.instagramUrl
      ? {
          brandIcon: faInstagram,
          href: settings.instagramUrl,
          label: "Instagram",
        }
      : null,
  ].filter(Boolean) as Array<{
    brandIcon: IconDefinition;
    href: string;
    label: string;
  }>;
  const contactItems: Array<{
    href?: string;
    icon: LucideIcon;
    label: string;
    value: string;
  }> = [
    {
      href: phoneHref(settings.contactPhone),
      icon: Phone,
      label: "Téléphone",
      value: settings.contactPhone,
    },
    {
      href: `mailto:${settings.contactEmail}`,
      icon: MessageSquareText,
      label: "Email",
      value: settings.contactEmail,
    },
    {
      icon: Building2,
      label: "Adresse",
      value: "Bonabéri, Cameroun",
    },
  ];
  const bodyLinks = categories.length
    ? categories
    : fallbackBodyTypes.map((name) => ({
        href: "/categories",
        id: name,
        name,
      }));

  return (
    <footer id="contact" className="bg-[#07070b] px-4 py-12 text-white sm:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 border-b border-white/10 pb-12 lg:grid-cols-[1fr_1fr_0.9fr_1.15fr] lg:gap-16">
          {footerColumns.map(({ heading, id, links }) => (
            <FooterLinkColumn heading={heading} id={id} key={id} links={links} />
          ))}

          <FooterLinkColumn
            heading="Par carrosserie"
            id="body"
            links={bodyLinks.map((category) => ({
              href: category.href,
              label: category.name,
            }))}
          />

          <div>
            <h3 className="text-xl font-semibold tracking-tight text-white">Par marque</h3>
            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
              {brands.length ? (
                brands.map((brand) => (
                  <Link
                    className="group grid min-h-24 place-items-center border border-white/10 bg-white/[0.08] px-3 py-4 text-center transition hover:border-[#a21d2f] hover:bg-[#a21d2f]/15"
                    href={brand.href}
                    key={brand.id}
                  >
                    {brand.logo ? (
                      <Image
                        alt={brand.name}
                        className="max-h-9 w-full object-contain brightness-0 invert opacity-90 transition group-hover:opacity-100"
                        height={44}
                        src={getMediaUrl(brand.logo)}
                        width={110}
                      />
                    ) : (
                      <span className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-sm font-semibold text-white">
                        {brand.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    <span className="mt-3 text-xs font-medium text-white/60">
                      {brand.vehicleCount} <span>{vehicleCountLabel(brand.vehicleCount)}</span>
                    </span>
                  </Link>
                ))
              ) : (
                <div className="col-span-full grid min-h-24 place-items-center border border-white/10 bg-white/[0.08] px-4 text-center text-sm text-white/60">
                  Marques disponibles bientôt
                </div>
              )}
            </div>
            <Link
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#d8d8dc] transition hover:text-[#a21d2f]"
              href="/marques"
            >
              Explorer toutes les marques
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="grid gap-8 border-b border-white/10 py-9 lg:grid-cols-[1.1fr_2fr_auto] lg:items-center">
          <Link className="inline-flex max-w-full items-center gap-3" href="/" aria-label={settings.companyName}>
            {logoUrl ? (
              <Image
                alt={settings.companyName}
                className="max-h-12 w-auto object-contain"
                height={settings.logoHeight}
                src={logoUrl}
                width={settings.logoWidth}
              />
            ) : (
              <>
                <CarFront className="h-9 w-9 text-[#a21d2f]" aria-hidden="true" />
                <span className="text-3xl font-semibold tracking-tight">{settings.companyName}</span>
              </>
            )}
          </Link>

          <div className="grid gap-5 md:grid-cols-3">
            {contactItems.map(({ href, icon: Icon, label, value }) => {
              const content = (
                <>
                  <span className="grid h-9 w-9 shrink-0 place-items-center text-[#a21d2f]">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-medium text-white/55">
                      <span>{label}</span>
                      <span aria-hidden="true">:</span>
                    </span>
                    <span className="mt-1 block break-words text-sm font-semibold text-white">{value}</span>
                  </span>
                </>
              );

              return href ? (
                <a className="flex min-w-0 items-center gap-3 transition hover:text-white" href={href} key={label}>
                  {content}
                </a>
              ) : (
                <div className="flex min-w-0 items-center gap-3" key={label}>
                  {content}
                </div>
              );
            })}
          </div>

          {socialLinks.length ? (
            <div className="flex items-center gap-3">
              {socialLinks.map((link) => (
                <a
                  aria-label={link.label}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.08] text-white ring-1 ring-white/5 transition hover:bg-[#a21d2f]"
                  href={link.href}
                  key={link.label}
                  rel="noreferrer"
                  target="_blank"
                >
                  <FontAwesomeBrandIcon className="h-4 w-4" icon={link.brandIcon} />
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-5 pt-9 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <Link className="transition hover:text-white" href="/#vehicules">
              Acheter une voiture
            </Link>
            <span className="h-4 w-px bg-white/20" aria-hidden="true" />
            <Link className="transition hover:text-white" href="/#contact">
              Contactez-nous
            </Link>
          </div>

          <p>
            © {new Date().getFullYear()} {settings.companyName}. <span>Tous droits réservés</span>{" "}
            <span>-</span> <span>Développé par</span>{" "}
            <a
              className="font-semibold text-white/75 transition hover:text-[#a21d2f]"
              href="https://nexadev-it.com/"
              rel="noopener noreferrer"
              target="_blank"
            >
              Nexadev It Solutions
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLinkColumn({
  heading,
  id,
  links,
}: {
  heading: string;
  id: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <div>
      <h3 className="text-xl font-semibold tracking-tight text-white">{heading}</h3>
      <div className="mt-6 grid gap-3 text-sm font-medium text-white/60">
        {links.map((link) => (
          <Link className="transition hover:text-white" href={link.href} key={`${id}-${link.label}`}>
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
