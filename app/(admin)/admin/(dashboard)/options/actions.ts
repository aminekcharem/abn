"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";

const optionCategorySchema = z.object({
  iconSvgText: z.string().trim().optional(),
  isActive: z.coerce.boolean(),
  name: z.string().trim().min(2, "Le nom est obligatoire.").max(80),
  order: z.coerce.number().int().min(0),
  slug: z.string().trim().min(2, "Le slug est obligatoire.").max(100),
});

const optionSchema = z.object({
  categoryId: z.string().min(1, "Selectionnez une categorie."),
  name: z.string().trim().min(2, "Le nom est obligatoire.").max(120),
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

function sanitizeSvg(value: string) {
  const svg = value.trim();

  if (!svg) return null;

  if (!svg.startsWith("<svg") || !svg.endsWith("</svg>")) {
    throw new Error("L'icone doit etre un SVG valide.");
  }

  return svg
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, "");
}

async function getSvgFromFormData(formData: FormData) {
  const svgFile = formData.get("iconSvgFile");

  if (svgFile instanceof File && svgFile.size > 0) {
    if (svgFile.type !== "image/svg+xml") {
      throw new Error("Le fichier icone doit etre un SVG.");
    }

    if (svgFile.size > 200 * 1024) {
      throw new Error("L'icone SVG ne doit pas depasser 200 Ko.");
    }

    return sanitizeSvg(await svgFile.text());
  }

  return sanitizeSvg(String(formData.get("iconSvgText") ?? ""));
}

export async function createOptionCategoryAction(formData: FormData) {
  await ensureAdmin();

  const parsed = optionCategorySchema.safeParse({
    iconSvgText: formData.get("iconSvgText"),
    isActive: getBoolean(formData, "isActive"),
    name: formData.get("name"),
    order: formData.get("order") || 0,
    slug:
      formData.get("slug") ||
      slugify(String(formData.get("name") ?? "")),
  });

  if (!parsed.success) {
    throw new Error("Categorie d'options invalide.");
  }

  const prisma = getPrisma();
  const iconSvg = await getSvgFromFormData(formData);

  await prisma.optionCategory.create({
    data: {
      iconSvg,
      isActive: parsed.data.isActive,
      name: parsed.data.name,
      order: parsed.data.order,
      slug: slugify(parsed.data.slug),
    },
  });

  revalidatePath("/admin/options");
  revalidatePath("/admin/vehicles/new");
}

export async function updateOptionCategoryAction(
  id: string,
  formData: FormData,
) {
  await ensureAdmin();

  const parsed = optionCategorySchema.safeParse({
    iconSvgText: formData.get("iconSvgText"),
    isActive: getBoolean(formData, "isActive"),
    name: formData.get("name"),
    order: formData.get("order") || 0,
    slug:
      formData.get("slug") ||
      slugify(String(formData.get("name") ?? "")),
  });

  if (!id || !parsed.success) {
    throw new Error("Categorie d'options invalide.");
  }

  const removeIcon = getBoolean(formData, "removeIcon");
  const iconSvg = await getSvgFromFormData(formData);
  const prisma = getPrisma();

  await prisma.optionCategory.update({
    data: {
      iconSvg: iconSvg ?? (removeIcon ? null : undefined),
      isActive: parsed.data.isActive,
      name: parsed.data.name,
      order: parsed.data.order,
      slug: slugify(parsed.data.slug),
    },
    where: { id },
  });

  revalidatePath("/admin/options");
  revalidatePath("/admin/vehicles/new");
}

export async function createOptionAction(formData: FormData) {
  await ensureAdmin();

  const parsed = optionSchema.safeParse({
    categoryId: formData.get("categoryId"),
    name: formData.get("name"),
  });

  if (!parsed.success) {
    throw new Error("Option invalide.");
  }

  const prisma = getPrisma();

  await prisma.option.upsert({
    create: parsed.data,
    update: {},
    where: {
      name_categoryId: {
        categoryId: parsed.data.categoryId,
        name: parsed.data.name,
      },
    },
  });

  revalidatePath("/admin/options");
  revalidatePath("/admin/vehicles/new");
}

export async function deleteOptionAction(formData: FormData) {
  await ensureAdmin();

  const id = String(formData.get("id") ?? "");

  if (!id) {
    throw new Error("Option introuvable.");
  }

  const prisma = getPrisma();

  await prisma.option.delete({ where: { id } });

  revalidatePath("/admin/options");
  revalidatePath("/admin/vehicles/new");
}

export async function deleteOptionCategoryAction(formData: FormData) {
  await ensureAdmin();

  const id = String(formData.get("id") ?? "");

  if (!id) {
    throw new Error("Categorie introuvable.");
  }

  const prisma = getPrisma();
  const optionsCount = await prisma.option.count({ where: { categoryId: id } });

  if (optionsCount > 0) {
    throw new Error(
      "Supprimez d'abord les options de cette categorie avant de supprimer la categorie.",
    );
  }

  await prisma.optionCategory.delete({ where: { id } });

  revalidatePath("/admin/options");
  revalidatePath("/admin/vehicles/new");
}
