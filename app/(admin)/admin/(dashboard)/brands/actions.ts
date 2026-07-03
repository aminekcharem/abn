"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { saveMediaFile } from "@/lib/media";
import { getPrisma } from "@/lib/prisma";

const brandSchema = z.object({
  countryOrigin: z.string().trim().max(80).optional(),
  isActive: z.coerce.boolean(),
  name: z.string().trim().min(2, "Le nom est obligatoire."),
  slug: z.string().trim().min(2, "Le slug est obligatoire."),
});

async function ensureAdmin() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function getUploadFile(formData: FormData, key = "logo") {
  const file = formData.get(key);
  return file instanceof File && file.size > 0 ? file : null;
}

async function saveBrandLogo(file: File | null) {
  if (!file) return null;

  const asset = await saveMediaFile(file, {
    directory: "brands",
    maxSizeMb: 1,
    source: "brand",
  });

  return asset.localPath;
}

export async function createBrandAction(formData: FormData) {
  await ensureAdmin();

  const parsed = brandSchema.safeParse({
    countryOrigin: formData.get("countryOrigin"),
    isActive: getBoolean(formData, "isActive"),
    name: formData.get("name"),
    slug:
      formData.get("slug") ||
      slugify(String(formData.get("name") ?? "")),
  });

  if (!parsed.success) {
    throw new Error("Marque invalide.");
  }

  const logo = await saveBrandLogo(getUploadFile(formData));
  const prisma = getPrisma();

  await prisma.brand.create({
    data: {
      countryOrigin: parsed.data.countryOrigin || null,
      isActive: parsed.data.isActive,
      logo,
      name: parsed.data.name,
      slug: slugify(parsed.data.slug),
    },
  });

  revalidatePath("/admin/brands");
  revalidatePath("/admin/vehicles/new");
  revalidatePath("/");
}

export async function updateBrandLogoAction(formData: FormData) {
  await ensureAdmin();

  const id = String(formData.get("id") ?? "");

  if (!id) {
    throw new Error("Marque introuvable.");
  }

  const logo = await saveBrandLogo(getUploadFile(formData));

  if (!logo) {
    throw new Error("Ajoutez un logo PNG, JPG, SVG ou WebP.");
  }

  const prisma = getPrisma();

  await prisma.brand.update({
    data: { logo },
    where: { id },
  });

  revalidatePath("/admin/brands");
  revalidatePath("/");
}

export async function toggleBrandStatusAction(formData: FormData) {
  await ensureAdmin();

  const id = String(formData.get("id") ?? "");
  const isActive = getBoolean(formData, "isActive");

  if (!id) {
    throw new Error("Marque introuvable.");
  }

  const prisma = getPrisma();

  await prisma.brand.update({
    data: { isActive },
    where: { id },
  });

  revalidatePath("/admin/brands");
  revalidatePath("/admin/vehicles/new");
  revalidatePath("/");
}
