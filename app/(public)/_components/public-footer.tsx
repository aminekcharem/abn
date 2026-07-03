import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { NewsletterForm } from "./newsletter-form";
import type { ShowroomSettingsView } from "@/lib/settings";

const footerSections = [
  {
    heading: "Showroom",
    id: "showroom",
    links: [
      { href: "/#top", label: "À propos" },
      { href: "/#inventory", label: "Notre stock" },
      { href: "/#inventory", label: "Financement" },
      { href: "/#contact", label: "Contact" },
    ],
  },
  {
    heading: "Véhicules",
    id: "vehicles",
    links: [
      { href: "/#inventory", label: "Nouveautés" },
      { href: "/#inventory", label: "SUV" },
      { href: "/#inventory", label: "Berlines" },
      { href: "/#inventory", label: "Hybrides" },
      { href: "/#inventory", label: "Occasions" },
    ],
  },
  {
    heading: "Assistance",
    id: "support",
    links: [
      { href: "/#inventory", label: "Demande d'achat" },
      { href: "/avis", label: "Avis clients" },
      { href: "/donner-un-avis", label: "Donner un avis" },
      { href: "/#contact", label: "Service client" },
    ],
  },
  {
    heading: "Horaires",
    id: "hours",
    links: [
      { href: "/#contact", label: "Lundi - Vendredi: 09:00 - 18:00" },
      { href: "/#contact", label: "Samedi: 09:00 - 14:00" },
      { href: "/#contact", label: "Dimanche: fermé" },
    ],
  },
];

type PublicFooterProps = {
  settings: ShowroomSettingsView;
};

function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function PublicFooter({ settings }: PublicFooterProps) {
  const logoUrl = settings.websiteLogoUrl || settings.logoUrl;

  return (
    <footer id="contact" className="bg-[#1b1b1b] px-4 pb-8 pt-12 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 border-b border-white/10 pb-10 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div>
            <h2 className="text-2xl font-semibold">Suivez {settings.companyName}</h2>
            <p className="mt-2 text-sm text-white/60">
              Recevez les nouveaux arrivages, les mises à jour de prix et nos conseils d&apos;achat.
            </p>
          </div>
          <NewsletterForm />
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-[1.1fr_1fr_1fr_1fr_1.15fr]">
          <div>
            <Link className="inline-flex max-w-full items-center" href="/" aria-label={settings.companyName}>
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={settings.companyName}
                  className="block max-h-14 max-w-[220px] object-contain"
                  height={settings.logoHeight}
                  src={logoUrl}
                  width={settings.logoWidth}
                />
              ) : (
                <span className="text-lg font-semibold tracking-tight">{settings.companyName}</span>
              )}
            </Link>
            <div className="mt-5 grid gap-3 text-sm text-white/62">
              <span className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-[#ffc10a]" />
                Showroom premium
              </span>
              <a className="flex items-center gap-3 transition hover:text-white" href={phoneHref(settings.contactPhone)}>
                <Phone className="h-4 w-4 text-[#ffc10a]" />
                {settings.contactPhone}
              </a>
              <a className="flex items-center gap-3 transition hover:text-white" href={`mailto:${settings.contactEmail}`}>
                <Mail className="h-4 w-4 text-[#ffc10a]" />
                {settings.contactEmail}
              </a>
            </div>
          </div>

          {footerSections.map(({ heading, id, links }) => (
            <div key={id}>
              <h3 className="text-sm font-semibold">{heading}</h3>
              <div className="mt-4 grid gap-2 text-sm text-white/60">
                {links.map((link) => (
                  <Link
                    className="transition hover:text-white"
                    href={link.href}
                    key={`${id}-${link.label}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-white/55">
          Copyright &copy; {new Date().getFullYear()} - Développé par{" "}
          <a
            className="font-semibold text-white transition hover:text-[#ffc10a]"
            href="https://nexadev-it.com/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Nexadev It Solutions
          </a>
        </div>
      </div>
    </footer>
  );
}
