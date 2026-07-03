import { Mail, Phone } from "lucide-react";
import { faFacebookF, faInstagram } from "@fortawesome/free-brands-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { LucideIcon } from "lucide-react";

import { FontAwesomeBrandIcon } from "./fontawesome-brand-icon";
import type { ShowroomSettingsView } from "@/lib/settings";

type FloatingContactBarProps = {
  settings: ShowroomSettingsView;
};

function phoneHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function FloatingContactBar({ settings }: FloatingContactBarProps) {
  if (!settings.showFloatingBar) return null;

  const links = [
    settings.facebookUrl
      ? {
          brandIcon: faFacebookF,
          href: settings.facebookUrl,
          label: "Facebook",
          external: true,
        }
      : null,
    settings.instagramUrl
      ? {
          brandIcon: faInstagram,
          href: settings.instagramUrl,
          label: "Instagram",
          external: true,
        }
      : null,
    { href: phoneHref(settings.contactPhone), icon: Phone, label: "Téléphone", external: false },
    { href: `mailto:${settings.contactEmail}`, icon: Mail, label: "E-mail", external: false },
  ].filter(Boolean) as Array<{
    brandIcon?: IconDefinition;
    external: boolean;
    href: string;
    icon?: LucideIcon;
    label: string;
  }>;

  return (
    <aside
      aria-label="Contacts rapides"
      className="fixed left-3 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-2 lg:flex"
    >
      {links.map(({ brandIcon, external, href, icon: Icon, label }) => (
        <a
          aria-label={label}
          className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-[#1b1b1b] text-white shadow-xl shadow-black/20 transition hover:bg-[#ffc10a] hover:text-[#1b1b1b]"
          href={href}
          key={label}
          rel={external ? "noreferrer" : undefined}
          target={external ? "_blank" : undefined}
        >
          {brandIcon ? (
            <FontAwesomeBrandIcon className="h-4 w-4" icon={brandIcon} />
          ) : Icon ? (
            <Icon className="h-4 w-4" />
          ) : null}
        </a>
      ))}
    </aside>
  );
}
