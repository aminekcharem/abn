"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { saveMediaFile } from "@/lib/media";
import { getPrisma } from "@/lib/prisma";

export type SettingsActionState = {
  fieldErrors?: Record<string, string[] | undefined>;
  message: string;
  ok: boolean;
};

const settingsSchema = z.object({
  adminTheme: z.enum(["DARK", "LIGHT"]),
  companyName: z
    .string()
    .trim()
    .min(2, "Le nom de l'entreprise est obligatoire.")
    .max(80, "Le nom ne doit pas depasser 80 caracteres."),
  contactEmail: z
    .string()
    .trim()
    .email("L'adresse e-mail est invalide.")
    .max(120, "L'adresse e-mail est trop longue."),
  contactPhone: z
    .string()
    .trim()
    .min(3, "Le numero de telephone est obligatoire.")
    .max(40, "Le numero de telephone est trop long."),
  facebookUrl: z
    .string()
    .trim()
    .url("Le lien Facebook doit etre une URL valide.")
    .max(240)
    .optional()
    .or(z.literal("")),
  instagramUrl: z
    .string()
    .trim()
    .url("Le lien Instagram doit etre une URL valide.")
    .max(240)
    .optional()
    .or(z.literal("")),
  showFloatingBar: z.enum(["true", "false"]).transform((value) => value === "true"),
  logoHeight: z.coerce.number().int().min(24).max(160),
  logoWidth: z.coerce.number().int().min(80).max(420),
});

type ParsedSettings = Omit<
  z.infer<typeof settingsSchema>,
  "facebookUrl" | "instagramUrl"
> & {
  facebookUrl: string | null;
  instagramUrl: string | null;
};

type ShowroomSettingsDelegate = {
  upsert: (args: {
    create: ParsedSettings & {
      authLogoUrl: string | null;
      id: string;
      logoUrl: string | null;
      websiteLogoUrl: string | null;
    };
    update: ParsedSettings & {
      authLogoUrl?: string;
      logoUrl?: string;
      websiteLogoUrl?: string;
    };
    where: { id: string };
  }) => Promise<unknown>;
};

type MediaAssetDelegate = {
  findUnique: (args: {
    select: { localPath: true };
    where: { localPath: string };
  }) => Promise<{ localPath: string } | null>;
};

async function ensureAdmin() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }
}

function getLogoFile(formData: FormData, fieldName: string) {
  const file = formData.get(fieldName);

  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  return file;
}

function getSelectedMediaPath(formData: FormData, fieldName: string) {
  const value = formData.get(fieldName);

  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  return value.trim();
}

async function assertMediaPathExists(
  mediaAsset: MediaAssetDelegate,
  localPath: string,
) {
  const asset = await mediaAsset.findUnique({
    select: { localPath: true },
    where: { localPath },
  });

  if (!asset) {
    throw new Error("Le media selectionne est introuvable dans la bibliotheque.");
  }

  return asset.localPath;
}

async function resolveLogoPath({
  fieldName,
  formData,
  mediaAsset,
  selectedFieldName,
  source,
}: {
  fieldName: string;
  formData: FormData;
  mediaAsset: MediaAssetDelegate;
  selectedFieldName: string;
  source: string;
}) {
  const file = getLogoFile(formData, fieldName);

  if (file) {
    return (
      await saveMediaFile(file, {
        directory: "settings",
        maxSizeMb: 2,
        source,
      })
    ).localPath;
  }

  const selectedPath = getSelectedMediaPath(formData, selectedFieldName);

  if (!selectedPath) {
    return undefined;
  }

  return assertMediaPathExists(mediaAsset, selectedPath);
}

function actionError(error: unknown): SettingsActionState {
  if (error instanceof Error) {
    return { ok: false, message: error.message };
  }

  return { ok: false, message: "Une erreur est survenue." };
}

function getShowroomSettingsDelegate() {
  const prisma = getPrisma() as ReturnType<typeof getPrisma> & {
    mediaAsset?: MediaAssetDelegate;
    showroomSettings?: ShowroomSettingsDelegate;
  };

  return {
    mediaAsset: prisma.mediaAsset,
    showroomSettings: prisma.showroomSettings,
  };
}

export async function updateShowroomSettings(
  _state: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  try {
    await ensureAdmin();

    const parsed = settingsSchema.safeParse({
      adminTheme: formData.get("adminTheme"),
      companyName: formData.get("companyName"),
      contactEmail: formData.get("contactEmail"),
      contactPhone: formData.get("contactPhone"),
      facebookUrl: formData.get("facebookUrl"),
      instagramUrl: formData.get("instagramUrl"),
      showFloatingBar: formData.get("showFloatingBar"),
      logoHeight: formData.get("logoHeight"),
      logoWidth: formData.get("logoWidth"),
    });

    if (!parsed.success) {
      return {
        ok: false,
        message: "Veuillez corriger les champs du formulaire.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const settingsValues: ParsedSettings = {
      ...parsed.data,
      facebookUrl: parsed.data.facebookUrl || null,
      instagramUrl: parsed.data.instagramUrl || null,
    };

    const { mediaAsset, showroomSettings } = getShowroomSettingsDelegate();

    if (!mediaAsset || !showroomSettings) {
      return {
        ok: false,
        message:
          "Le client Prisma doit etre regenere puis le serveur redemarre.",
      };
    }

    const logoUrl = await resolveLogoPath({
      fieldName: "logo",
      formData,
      mediaAsset,
      selectedFieldName: "logoMediaPath",
      source: "settings-logo",
    });
    const websiteLogoUrl = await resolveLogoPath({
      fieldName: "websiteLogo",
      formData,
      mediaAsset,
      selectedFieldName: "websiteLogoMediaPath",
      source: "settings-website-logo",
    });
    const authLogoUrl = await resolveLogoPath({
      fieldName: "authLogo",
      formData,
      mediaAsset,
      selectedFieldName: "authLogoMediaPath",
      source: "settings-auth-logo",
    });

    await showroomSettings.upsert({
      create: {
        ...settingsValues,
        authLogoUrl: authLogoUrl ?? null,
        id: "main",
        logoUrl: logoUrl ?? null,
        websiteLogoUrl: websiteLogoUrl ?? null,
      },
      update: {
        ...settingsValues,
        ...(authLogoUrl ? { authLogoUrl } : {}),
        ...(logoUrl ? { logoUrl } : {}),
        ...(websiteLogoUrl ? { websiteLogoUrl } : {}),
      },
      where: { id: "main" },
    });

    revalidatePath("/");
    revalidatePath("/admin/login");
    revalidatePath("/admin/settings");
    revalidatePath("/admin", "layout");

    return {
      ok: true,
      message: "Parametres du showroom enregistres.",
    };
  } catch (error) {
    return actionError(error);
  }
}
