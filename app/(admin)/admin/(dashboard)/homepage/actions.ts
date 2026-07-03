"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { saveMediaFile } from "@/lib/media";
import { getPrisma } from "@/lib/prisma";
import { getMediaUrl } from "@/lib/cdn";
import { defaultFaqItems, defaultWhyChooseItems } from "@/lib/homepage-settings";

export type HomepageActionState = {
  fieldErrors?: Record<string, string[] | undefined>;
  message: string;
  ok: boolean;
};

export type HomepageMediaOption = {
  height: number | null;
  id: string;
  localPath: string;
  name: string;
  previewUrl: string;
  width: number | null;
};

export type HomepageMediaPage = {
  hasMore: boolean;
  items: HomepageMediaOption[];
  nextPage: number;
};

const mediaPageSize = 60;

const textField = z.string().trim().min(2).max(180);
const longTextField = z.string().trim().min(10).max(1200);

const homepageSchema = z.object({
  aboutText: longTextField,
  aboutTitle: textField,
  showFaqs: z.enum(["true", "false"]).transform((value) => value === "true"),
  showReviews: z.enum(["true", "false"]).transform((value) => value === "true"),
  spotlightDescription: longTextField,
  spotlightTitle: textField,
  spotlightVehicleId: z.string().trim().optional(),
  whyChooseUsTitle: textField,
});

type HomepageSettingsWrite = Omit<
  z.infer<typeof homepageSchema>,
  "spotlightVehicleId"
> & {
  categoryOrder: string[];
  faqItems: Array<{ answer: string; question: string }>;
  featuredVehicleIds: string[];
  heroSlides: Array<{ imagePath: string | null; vehicleId: string }>;
  showFaqs: boolean;
  spotlightVehicleId: string | null;
  whyChooseUsItems: Array<{ text: string; title: string }>;
};

type HomepageSettingsDelegate = {
  upsert: (args: {
    create: HomepageSettingsWrite & { id: string };
    update: HomepageSettingsWrite;
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

function formString(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value.trim() : "";
}

function orderedIds(formData: FormData, fieldName: string, orderPrefix: string) {
  return formData
    .getAll(fieldName)
    .filter((value): value is string => typeof value === "string" && Boolean(value))
    .map((id) => ({
      id,
      order: Number(formString(formData, `${orderPrefix}${id}`) || 0),
    }))
    .sort((a, b) => a.order - b.order)
    .map((item) => item.id);
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

async function heroImagePath({
  formData,
  index,
  mediaAsset,
}: {
  formData: FormData;
  index: number;
  mediaAsset: MediaAssetDelegate;
}) {
  const file = formData.get(`heroImage${index}`);

  if (file instanceof File && file.size > 0) {
    return (
      await saveMediaFile(file, {
        directory: "homepage",
        maxSizeMb: 4,
        source: "homepage-hero",
      })
    ).localPath;
  }

  const selectedMedia = formString(formData, `heroImageMediaPath${index}`);

  if (selectedMedia) {
    return assertMediaPathExists(mediaAsset, selectedMedia);
  }

  const currentMedia = formString(formData, `heroCurrentImagePath${index}`);

  return currentMedia || null;
}

async function buildHeroSlides(
  formData: FormData,
  mediaAsset: MediaAssetDelegate,
) {
  const slides = [];

  for (let index = 0; index < 5; index += 1) {
    const vehicleId = formString(formData, `heroVehicleId${index}`);

    if (!vehicleId) continue;

    slides.push({
      imagePath: await heroImagePath({ formData, index, mediaAsset }),
      vehicleId,
    });
  }

  return slides;
}

function buildWhyChooseItems(formData: FormData) {
  const items = [];

  for (let index = 0; index < 4; index += 1) {
    const title = formString(formData, `whyTitle${index}`);
    const text = formString(formData, `whyText${index}`);

    if (!title && !text) continue;

    items.push({ text, title });
  }

  return items.length ? items : defaultWhyChooseItems;
}

function buildFaqItems(formData: FormData) {
  const rawIndexes = formData
    .getAll("faqIndex")
    .filter((value): value is string => typeof value === "string");
  const indexes = rawIndexes.length
    ? rawIndexes
    : Array.from({ length: 4 }, (_, index) => String(index));
  const items = [];

  for (const index of indexes.slice(0, 12)) {
    const question = formString(formData, `faqQuestion${index}`);
    const answer = formString(formData, `faqAnswer${index}`);

    if (!question && !answer) continue;

    items.push({ answer, question });
  }

  return items.length ? items : defaultFaqItems;
}

function getHomepageSettingsDelegate() {
  const prisma = getPrisma() as ReturnType<typeof getPrisma> & {
    homepageSettings?: HomepageSettingsDelegate;
    mediaAsset?: MediaAssetDelegate;
  };

  return {
    homepageSettings: prisma.homepageSettings,
    mediaAsset: prisma.mediaAsset,
  };
}

function mapMediaAsset(asset: {
  height: number | null;
  id: string;
  localPath: string;
  originalName: string;
  title: string | null;
  width: number | null;
}): HomepageMediaOption {
  return {
    height: asset.height,
    id: asset.id,
    localPath: asset.localPath,
    name: asset.title || asset.originalName,
    previewUrl: getMediaUrl(asset.localPath),
    width: asset.width,
  };
}

function actionError(error: unknown): HomepageActionState {
  if (error instanceof Error) {
    return { ok: false, message: error.message };
  }

  return { ok: false, message: "Une erreur est survenue." };
}

export async function getHomepageMediaOptions(page = 0): Promise<HomepageMediaPage> {
  await ensureAdmin();

  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 0;
  const prisma = getPrisma();
  const assets = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      height: true,
      id: true,
      localPath: true,
      originalName: true,
      title: true,
      width: true,
    },
    skip: safePage * mediaPageSize,
    take: mediaPageSize + 1,
    where: { mimeType: { startsWith: "image/" } },
  });
  const items = assets.slice(0, mediaPageSize).map(mapMediaAsset);

  return {
    hasMore: assets.length > mediaPageSize,
    items,
    nextPage: safePage + 1,
  };
}

export async function updateHomepageSettings(
  _state: HomepageActionState,
  formData: FormData,
): Promise<HomepageActionState> {
  try {
    await ensureAdmin();

    const parsed = homepageSchema.safeParse({
      aboutText: formData.get("aboutText"),
      aboutTitle: formData.get("aboutTitle"),
      showFaqs: formData.get("showFaqs"),
      showReviews: formData.get("showReviews"),
      spotlightDescription: formData.get("spotlightDescription"),
      spotlightTitle: formData.get("spotlightTitle"),
      spotlightVehicleId: formData.get("spotlightVehicleId"),
      whyChooseUsTitle: formData.get("whyChooseUsTitle"),
    });

    if (!parsed.success) {
      return {
        ok: false,
        message: "Veuillez corriger les champs du formulaire.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const { homepageSettings, mediaAsset } = getHomepageSettingsDelegate();

    if (!homepageSettings || !mediaAsset) {
      return {
        ok: false,
        message:
          "Le client Prisma doit etre regenere puis le serveur redemarre.",
      };
    }

    const heroSlides = await buildHeroSlides(formData, mediaAsset);

    if (!heroSlides.length) {
      return {
        fieldErrors: { heroSlides: ["Selectionnez au moins un vehicule pour le hero."] },
        message: "Veuillez corriger les champs du formulaire.",
        ok: false,
      };
    }

    const whyChooseUsItems = buildWhyChooseItems(formData);
    const faqItems = buildFaqItems(formData);

    if (
      whyChooseUsItems.some((item) => item.title.length < 2 || item.text.length < 10)
    ) {
      return {
        fieldErrors: {
          whyChooseUsItems: [
            "Chaque raison doit contenir un titre et une description complete.",
          ],
        },
        message: "Veuillez corriger les champs du formulaire.",
        ok: false,
      };
    }

    if (
      faqItems.some((item) => item.question.length < 2 || item.answer.length < 10)
    ) {
      return {
        fieldErrors: {
          faqItems: [
            "Chaque FAQ doit contenir une question et une reponse complete.",
          ],
        },
        message: "Veuillez corriger les champs du formulaire.",
        ok: false,
      };
    }

    const settingsValues: HomepageSettingsWrite = {
      aboutText: parsed.data.aboutText,
      aboutTitle: parsed.data.aboutTitle,
      categoryOrder: orderedIds(formData, "categoryId", "categoryOrder-"),
      faqItems,
      featuredVehicleIds: orderedIds(
        formData,
        "featuredVehicleId",
        "featuredVehicleOrder-",
      ),
      heroSlides,
      showFaqs: parsed.data.showFaqs,
      showReviews: parsed.data.showReviews,
      spotlightDescription: parsed.data.spotlightDescription,
      spotlightTitle: parsed.data.spotlightTitle,
      spotlightVehicleId: parsed.data.spotlightVehicleId || null,
      whyChooseUsItems,
      whyChooseUsTitle: parsed.data.whyChooseUsTitle,
    };

    await homepageSettings.upsert({
      create: {
        ...settingsValues,
        id: "main",
      },
      update: settingsValues,
      where: { id: "main" },
    });

    revalidatePath("/");
    revalidatePath("/admin/homepage");

    return {
      message: "Configuration de la page d'accueil enregistree.",
      ok: true,
    };
  } catch (error) {
    return actionError(error);
  }
}
