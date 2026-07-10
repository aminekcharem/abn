"use server";

import { revalidatePath, revalidateTag } from "next/cache";
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

export type BrandActionState = {
  fieldErrors?: {
    countryOrigin?: string[];
    name?: string[];
    slug?: string[];
  };
  message?: string;
  status?: "error" | "success";
};

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

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
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

export async function createBrandAction(
  _state: BrandActionState,
  formData: FormData,
): Promise<BrandActionState> {
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
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
      message: "Veuillez corriger les champs du formulaire.",
      status: "error",
    };
  }

  const prisma = getPrisma();
  const slug = slugify(parsed.data.slug);
  const existingBrand = await prisma.brand.findFirst({
    select: { name: true, slug: true },
    where: {
      OR: [{ slug }, { name: parsed.data.name }],
    },
  });

  if (existingBrand) {
    const field = existingBrand.slug === slug ? "slug" : "name";

    return {
      fieldErrors: {
        [field]: [
          "Cette marque existe deja et ne peut pas etre ajoutee en double.",
        ],
      },
      message: "Cette marque existe deja et ne peut pas etre ajoutee en double.",
      status: "error",
    };
  }

  const logo = await saveBrandLogo(getUploadFile(formData));

  try {
    await prisma.brand.create({
      data: {
        countryOrigin: parsed.data.countryOrigin || null,
        isActive: parsed.data.isActive,
        logo,
        name: parsed.data.name,
        slug,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        fieldErrors: {
          slug: [
            "Cette marque existe deja et ne peut pas etre ajoutee en double.",
          ],
        },
        message: "Cette marque existe deja et ne peut pas etre ajoutee en double.",
        status: "error",
      };
    }

    throw error;
  }

  revalidatePath("/admin/brands");
  revalidatePath("/admin/vehicles/new");
  revalidatePath("/");
  revalidatePath("/marques");
  revalidateTag("public-brand-links", "max");

  return {
    message: "Marque ajoutee avec succes.",
    status: "success",
  };
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
  revalidatePath("/marques");
  revalidateTag("public-brand-links", "max");
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
  revalidatePath("/marques");
  revalidateTag("public-brand-links", "max");
}
