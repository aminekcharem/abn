import { existsSync } from "node:fs";
import path from "node:path";

import { getMediaUrl } from "@/lib/cdn";
import { getPrisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

const defaultAdminLogoPath =
  "/uploads/settings/1782313204377-1def4e9f-8e5b-4c94-969f-eb788dff278d-logo-autopro-dark-bg-02.svg";
const defaultWebsiteLogoPath =
  "/uploads/settings/1782395026222-b8c771e0-c576-4590-8817-0074626793eb-logo-autopro-white.svg";

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
  authLogoPath: defaultAdminLogoPath,
  authLogoUrl: getMediaUrl(defaultAdminLogoPath),
  companyName: "AutoPro Showroom",
  contactEmail: "contact@autopro.test",
  contactPhone: "+216 00 000 000",
  facebookUrl: null,
  instagramUrl: null,
  showFloatingBar: true,
  logoHeight: 48,
  logoPath: defaultAdminLogoPath,
  logoUrl: getMediaUrl(defaultAdminLogoPath),
  logoWidth: 160,
  websiteLogoPath: defaultWebsiteLogoPath,
  websiteLogoUrl: getMediaUrl(defaultWebsiteLogoPath),
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

function localMediaPathExists(pathOrUrl: string | null) {
  if (!pathOrUrl) {
    return false;
  }

  if (/^https?:\/\//i.test(pathOrUrl)) {
    return true;
  }

  const mediaUrl = getMediaUrl(pathOrUrl);

  if (!mediaUrl.startsWith("/uploads/")) {
    return true;
  }

  return existsSync(path.join(process.cwd(), "public", mediaUrl));
}

function resolveLogoPath(
  pathOrUrl: string | null,
  fallbackPath: string | null,
) {
  return localMediaPathExists(pathOrUrl) ? pathOrUrl : fallbackPath;
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
    const logoPath = resolveLogoPath(
      settings.logoUrl,
      defaultShowroomSettings.logoPath,
    );
    const websiteLogoPath = resolveLogoPath(
      settings.websiteLogoUrl,
      defaultShowroomSettings.websiteLogoPath,
    );
    const authLogoPath = resolveLogoPath(
      settings.authLogoUrl,
      logoPath || defaultShowroomSettings.authLogoPath,
    );

    return {
      companyName: settings.companyName,
      adminTheme: settings.adminTheme,
      authLogoPath,
      authLogoUrl: authLogoPath ? getMediaUrl(authLogoPath) : null,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      facebookUrl: settings.facebookUrl,
      instagramUrl: settings.instagramUrl,
      showFloatingBar: settings.showFloatingBar,
      logoHeight: settings.logoHeight,
      logoPath,
      logoUrl: logoPath ? getMediaUrl(logoPath) : null,
      logoWidth: settings.logoWidth,
      websiteLogoPath,
      websiteLogoUrl: websiteLogoPath ? getMediaUrl(websiteLogoPath) : null,
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
