"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { defaultTranslationEntries } from "@/lib/default-translations";
import { getPrisma } from "@/lib/prisma";

const translationSchema = z.object({
  isActive: z.coerce.boolean(),
  sourceText: z.string().trim().min(1, "Le texte français est obligatoire.").max(500),
  targetText: z.string().trim().min(1, "Le texte anglais est obligatoire.").max(2000),
});

async function ensureAdmin() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }
}

function getBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function revalidateTranslations() {
  revalidatePath("/admin/translations");
  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/marques");
  revalidatePath("/avis");
  revalidatePath("/donner-un-avis");
  revalidateTag("public-translations", "max");
}

function getTranslationDelegate(prisma: ReturnType<typeof getPrisma>) {
  return (
    prisma as ReturnType<typeof getPrisma> & {
      translationEntry?: {
        findUnique: (args: unknown) => Promise<{ id: string } | null>;
        update: (args: unknown) => Promise<unknown>;
        upsert: (args: unknown) => Promise<unknown>;
      };
    }
  ).translationEntry;
}

async function upsertTranslation(
  prisma: ReturnType<typeof getPrisma>,
  data: {
    isActive: boolean;
    sourceText: string;
    targetText: string;
  },
  overwriteExisting: boolean,
) {
  const translationEntry = getTranslationDelegate(prisma);

  if (translationEntry) {
    await translationEntry.upsert({
      create: data,
      update: overwriteExisting
        ? {
            isActive: data.isActive,
            targetText: data.targetText,
          }
        : {},
      where: { sourceText: data.sourceText },
    });
    return;
  }

  if (overwriteExisting) {
    await prisma.$executeRawUnsafe(
      "INSERT INTO TranslationEntry (id, sourceText, targetText, isActive, createdAt, updatedAt) VALUES (UUID(), ?, ?, ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3)) ON DUPLICATE KEY UPDATE targetText = VALUES(targetText), isActive = VALUES(isActive), updatedAt = CURRENT_TIMESTAMP(3)",
      data.sourceText,
      data.targetText,
      data.isActive,
    );
    return;
  }

  await prisma.$executeRawUnsafe(
    "INSERT IGNORE INTO TranslationEntry (id, sourceText, targetText, isActive, createdAt, updatedAt) VALUES (UUID(), ?, ?, ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))",
    data.sourceText,
    data.targetText,
    data.isActive,
  );
}

export async function createTranslationAction(formData: FormData) {
  await ensureAdmin();

  const parsed = translationSchema.safeParse({
    isActive: getBoolean(formData, "isActive"),
    sourceText: formData.get("sourceText"),
    targetText: formData.get("targetText"),
  });

  if (!parsed.success) {
    throw new Error("Traduction invalide.");
  }

  const prisma = getPrisma();

  await upsertTranslation(prisma, parsed.data, true);

  revalidateTranslations();
}

export async function updateTranslationAction(formData: FormData) {
  await ensureAdmin();

  const id = String(formData.get("id") ?? "");
  const originalSourceText = String(formData.get("originalSourceText") ?? "").trim();
  const parsed = translationSchema.safeParse({
    isActive: getBoolean(formData, "isActive"),
    sourceText: formData.get("sourceText"),
    targetText: formData.get("targetText"),
  });

  if (!id || !originalSourceText || !parsed.success) {
    throw new Error("Traduction invalide.");
  }

  const prisma = getPrisma();
  const translationEntry = getTranslationDelegate(prisma);

  if (translationEntry && originalSourceText !== parsed.data.sourceText) {
    const existing = await translationEntry.findUnique({
      select: { id: true },
      where: { sourceText: parsed.data.sourceText },
    });

    if (existing && existing.id !== id) {
      throw new Error("Ce texte français existe déjà dans le module translate.");
    }
  }

  if (translationEntry) {
    await translationEntry.update({
      data: parsed.data,
      where: { id },
    });
  } else {
    await prisma.$executeRawUnsafe(
      "UPDATE TranslationEntry SET sourceText = ?, targetText = ?, isActive = ?, updatedAt = CURRENT_TIMESTAMP(3) WHERE id = ?",
      parsed.data.sourceText,
      parsed.data.targetText,
      parsed.data.isActive,
      id,
    );
  }

  revalidateTranslations();
}

export async function syncDetectedTranslationsAction() {
  await ensureAdmin();

  const prisma = getPrisma();
  const uniqueEntries = new Map(
    defaultTranslationEntries.map((entry) => [
      entry.sourceText.trim(),
      entry.targetText.trim(),
    ]),
  );

  for (const [sourceText, targetText] of uniqueEntries) {
    if (!sourceText || !targetText) continue;

    await upsertTranslation(
      prisma,
      {
        isActive: true,
        sourceText,
        targetText,
      },
      false,
    );
  }

  revalidateTranslations();
}
