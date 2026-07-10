"use server";

import { unlink } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { saveMediaFile } from "@/lib/media";
import { getPrisma } from "@/lib/prisma";

export type MediaActionState = {
  message: string;
  ok: boolean;
};

const mediaAttributesSchema = z.object({
  alt: z.string().trim().max(191, "Le texte alternatif est trop long.").optional(),
  caption: z.string().trim().max(1000, "La legende est trop longue.").optional(),
  id: z.string().min(1, "Media introuvable."),
  title: z.string().trim().max(191, "Le titre est trop long.").optional(),
});

const uploadAttributesSchema = mediaAttributesSchema.omit({ id: true });
const MAX_MEDIA_FILES = 100;

async function ensureAdmin() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }
}

function getMediaFiles(formData: FormData) {
  return formData
    .getAll("files")
    .filter((file): file is File => file instanceof File && file.size > 0);
}

function actionError(error: unknown): MediaActionState {
  if (error instanceof Error) {
    return { ok: false, message: error.message };
  }

  return { ok: false, message: "Une erreur est survenue." };
}

export async function uploadMediaAssets(
  _state: MediaActionState,
  formData: FormData,
): Promise<MediaActionState> {
  try {
    await ensureAdmin();

    const files = getMediaFiles(formData);

    if (!files.length) {
      return { ok: false, message: "Selectionnez au moins une image." };
    }

    if (files.length > MAX_MEDIA_FILES) {
      return { ok: false, message: `Maximum ${MAX_MEDIA_FILES} images par envoi.` };
    }

    const attributes = uploadAttributesSchema.parse({
      alt: formData.get("alt"),
      caption: formData.get("caption"),
      title: formData.get("title"),
    });

    for (const file of files) {
      await saveMediaFile(file, {
        alt: attributes.alt,
        caption: attributes.caption,
        directory: "media",
        maxSizeMb: 10,
        source: "media-library",
        title: attributes.title,
      });
    }

    revalidatePath("/admin/media");

    return {
      ok: true,
      message:
        files.length === 1
          ? "Image ajoutee et optimisee."
          : `${files.length} images ajoutees et optimisees.`,
    };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateMediaAssetAttributes(formData: FormData) {
  await ensureAdmin();

  const parsed = mediaAttributesSchema.safeParse({
    alt: formData.get("alt"),
    caption: formData.get("caption"),
    id: formData.get("id"),
    title: formData.get("title"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Attributs invalides.");
  }

  const prisma = getPrisma();

  await prisma.mediaAsset.update({
    data: {
      alt: parsed.data.alt || null,
      caption: parsed.data.caption || null,
      title: parsed.data.title || null,
    },
    where: { id: parsed.data.id },
  });

  revalidatePath("/admin/media");
}

async function assertAssetIsUnused(localPath: string, publicUrl: string) {
  const prisma = getPrisma();
  const [vehicles, categories, brands, settings] = await Promise.all([
    prisma.vehicle.findMany({ select: { images: true, title: true, videos: true } }),
    prisma.category.findMany({ select: { image: true, name: true } }),
    prisma.brand.findMany({ select: { logo: true, name: true } }),
    prisma.showroomSettings.findUnique({
      select: { logoUrl: true },
      where: { id: "main" },
    }),
  ]);

  const values = new Set([localPath, publicUrl]);
  const vehicle = vehicles.find(
    (item) =>
      Array.isArray(item.images) &&
      item.images.some((image) => typeof image === "string" && values.has(image)) ||
      (Array.isArray(item.videos) &&
        item.videos.some((video) => typeof video === "string" && values.has(video))),
  );

  if (vehicle) {
    throw new Error(`Cette image est utilisee par le vehicule "${vehicle.title}".`);
  }

  const category = categories.find((item) => item.image && values.has(item.image));

  if (category) {
    throw new Error(`Cette image est utilisee par la categorie "${category.name}".`);
  }

  const brand = brands.find((item) => item.logo && values.has(item.logo));

  if (brand) {
    throw new Error(`Cette image est utilisee par la marque "${brand.name}".`);
  }

  if (settings?.logoUrl && values.has(settings.logoUrl)) {
    throw new Error("Cette image est utilisee comme logo du backoffice.");
  }
}

export async function deleteMediaAsset(formData: FormData) {
  await ensureAdmin();

  const id = String(formData.get("id") ?? "");

  if (!id) {
    throw new Error("Media introuvable.");
  }

  const prisma = getPrisma();
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });

  if (!asset) {
    throw new Error("Media introuvable.");
  }

  await assertAssetIsUnused(asset.localPath, asset.publicUrl);
  await prisma.mediaAsset.delete({ where: { id } });

  if (asset.localPath.startsWith("/uploads/")) {
    const absolutePath = path.join(process.cwd(), "public", asset.localPath);
    await unlink(absolutePath).catch(() => undefined);
  }

  revalidatePath("/admin/media");
}
