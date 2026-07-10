import { getMediaUrl } from "@/lib/cdn";
import { getPrisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export type ShowroomSettingsView = {
  adminTheme: "DARK" | "LIGHT";
  authLogoPath: string | null;
  authLogoUrl: string | null;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  facebookUrl: string | null;
  instagramUrl: string | null;
  showFloatingBar: boolean;
  logoHeight: number;
  logoPath: string | null;
  logoUrl: string | null;
  logoWidth: number;
  websiteLogoPath: string | null;
  websiteLogoUrl: string | null;
};

export const defaultShowroomSettings: ShowroomSettingsView = {
  adminTheme: "DARK",
  authLogoPath: null,
  authLogoUrl: null,
  companyName: "AutoPro Showroom",
  contactEmail: "contact@autopro.test",
  contactPhone: "+216 00 000 000",
  facebookUrl: null,
  instagramUrl: null,
  showFloatingBar: true,
  logoHeight: 48,
  logoPath: null,
  logoUrl: null,
  logoWidth: 160,
  websiteLogoPath: null,
  websiteLogoUrl: null,
};

type ShowroomSettingsRecord = {
  adminTheme: "DARK" | "LIGHT";
  authLogoUrl: string | null;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  facebookUrl: string | null;
  instagramUrl: string | null;
  showFloatingBar: boolean;
  logoHeight: number;
  logoUrl: string | null;
  logoWidth: number;
  websiteLogoUrl: string | null;
};

type ShowroomSettingsDelegate = {
  upsert: (args: {
    create: ShowroomSettingsRecord & { id: string };
    update: Record<string, never>;
    where: { id: string };
  }) => Promise<ShowroomSettingsRecord>;
};

function getShowroomSettingsDelegate() {
  const prisma = getPrisma() as ReturnType<typeof getPrisma> & {
    showroomSettings?: ShowroomSettingsDelegate;
  };

  return prisma.showroomSettings;
}

async function readShowroomSettings(): Promise<ShowroomSettingsView> {
  try {
    const showroomSettings = getShowroomSettingsDelegate();

    if (!showroomSettings) {
      return defaultShowroomSettings;
    }

    const settings = await showroomSettings.upsert({
      create: {
        adminTheme: defaultShowroomSettings.adminTheme,
        authLogoUrl: defaultShowroomSettings.authLogoPath,
        companyName: defaultShowroomSettings.companyName,
        contactEmail: defaultShowroomSettings.contactEmail,
        contactPhone: defaultShowroomSettings.contactPhone,
        facebookUrl: defaultShowroomSettings.facebookUrl,
        id: "main",
        instagramUrl: defaultShowroomSettings.instagramUrl,
        showFloatingBar: defaultShowroomSettings.showFloatingBar,
        logoHeight: defaultShowroomSettings.logoHeight,
        logoUrl: defaultShowroomSettings.logoPath,
        logoWidth: defaultShowroomSettings.logoWidth,
        websiteLogoUrl: defaultShowroomSettings.websiteLogoPath,
      },
      update: {},
      where: { id: "main" },
    });

    return {
      companyName: settings.companyName,
      adminTheme: settings.adminTheme,
      authLogoPath: settings.authLogoUrl,
      authLogoUrl: settings.authLogoUrl ? getMediaUrl(settings.authLogoUrl) : null,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      facebookUrl: settings.facebookUrl,
      instagramUrl: settings.instagramUrl,
      showFloatingBar: settings.showFloatingBar,
      logoHeight: settings.logoHeight,
      logoPath: settings.logoUrl,
      logoUrl: settings.logoUrl ? getMediaUrl(settings.logoUrl) : null,
      logoWidth: settings.logoWidth,
      websiteLogoPath: settings.websiteLogoUrl,
      websiteLogoUrl: settings.websiteLogoUrl
        ? getMediaUrl(settings.websiteLogoUrl)
        : null,
    };
  } catch {
    return defaultShowroomSettings;
  }
}

export const getShowroomSettings = unstable_cache(
  readShowroomSettings,
  ["showroom-settings"],
  {
    revalidate: 300,
    tags: ["showroom-settings"],
  },
);
