"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { saveMediaFile } from "@/lib/media";
import { getPrisma } from "@/lib/prisma";

const categorySchema = z.object({
  description: z.string().trim().max(500).optional(),
  icon: z.string().trim().min(1),
  isActive: z.coerce.boolean(),
  name: z.string().trim().min(2, "Le nom est obligatoire."),
  order: z.coerce.number().int().min(0),
  showOnCategoriesPage: z.coerce.boolean(),
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

function getUploadFile(formData: FormData, key = "visual") {
  const file = formData.get(key);
  return file instanceof File && file.size > 0 ? file : null;
}

async function saveCategoryVisual(file: File | null) {
  if (!file) return null;

  const asset = await saveMediaFile(file, {
    directory: "categories",
    maxSizeMb: 1,
    source: "category",
  });

  return asset.localPath;
}

export async function createCategoryAction(formData: FormData) {
  await ensureAdmin();

  const parsed = categorySchema.safeParse({
    description: formData.get("description"),
    icon: formData.get("icon") || "car",
    isActive: getBoolean(formData, "isActive"),
    name: formData.get("name"),
    order: formData.get("order") || 0,
    showOnCategoriesPage: getBoolean(formData, "showOnCategoriesPage"),
    slug:
      formData.get("slug") ||
      slugify(String(formData.get("name") ?? "")),
  });

  if (!parsed.success) {
    throw new Error("Categorie invalide.");
  }

  const prisma = getPrisma();
  const image = await saveCategoryVisual(getUploadFile(formData));

  await prisma.category.create({
    data: {
      description: parsed.data.description || null,
      icon: parsed.data.icon,
      image,
      isActive: parsed.data.isActive,
      name: parsed.data.name,
      order: parsed.data.order,
      showOnCategoriesPage: parsed.data.showOnCategoriesPage,
      showOnHomepage: true,
      slug: slugify(parsed.data.slug),
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/categories");
}

export async function updateCategoryAction(id: string, formData: FormData) {
  await ensureAdmin();

  const parsed = categorySchema.safeParse({
    description: formData.get("description"),
    icon: formData.get("icon") || "car",
    isActive: getBoolean(formData, "isActive"),
    name: formData.get("name"),
    order: formData.get("order") || 0,
    showOnCategoriesPage: getBoolean(formData, "showOnCategoriesPage"),
    slug:
      formData.get("slug") ||
      slugify(String(formData.get("name") ?? "")),
  });

  if (!id) {
    throw new Error("Categorie introuvable.");
  }

  if (!parsed.success) {
    throw new Error("Categorie invalide.");
  }

  const uploadedImage = await saveCategoryVisual(getUploadFile(formData));
  const removeVisual = getBoolean(formData, "removeVisual");
  const prisma = getPrisma();

  await prisma.category.update({
    data: {
      description: parsed.data.description || null,
      icon: parsed.data.icon,
      image: uploadedImage ?? (removeVisual ? null : undefined),
      isActive: parsed.data.isActive,
      name: parsed.data.name,
      order: parsed.data.order,
      showOnCategoriesPage: parsed.data.showOnCategoriesPage,
      slug: slugify(parsed.data.slug),
    },
    where: { id },
  });

  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${id}/edit`);
  revalidatePath("/");
  revalidatePath("/categories");
}

export async function updateCategoryVisualAction(formData: FormData) {
  await ensureAdmin();

  const id = String(formData.get("id") ?? "");

  if (!id) {
    throw new Error("Categorie introuvable.");
  }

  const image = await saveCategoryVisual(getUploadFile(formData));

  if (!image) {
    throw new Error("Ajoutez une image PNG, JPG, SVG ou WebP.");
  }

  const prisma = getPrisma();

  await prisma.category.update({
    data: { image },
    where: { id },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/categories");
}

export async function toggleCategoryStatusAction(formData: FormData) {
  await ensureAdmin();

  const id = String(formData.get("id") ?? "");
  const isActive = getBoolean(formData, "isActive");

  if (!id) {
    throw new Error("Categorie introuvable.");
  }

  const prisma = getPrisma();

  await prisma.category.update({
    data: { isActive },
    where: { id },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/categories");
}
