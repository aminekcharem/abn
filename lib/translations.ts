import { getPrisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export type PublicTranslationEntry = {
  sourceText: string;
  targetText: string;
};

async function readPublicTranslations(): Promise<PublicTranslationEntry[]> {
  try {
    const prisma = getPrisma();
    const translationEntry = (
      prisma as ReturnType<typeof getPrisma> & {
        translationEntry?: {
          findMany: (args: unknown) => Promise<PublicTranslationEntry[]>;
        };
      }
    ).translationEntry;
    const entries = translationEntry
      ? await translationEntry.findMany({
          orderBy: { sourceText: "asc" },
          select: {
            sourceText: true,
            targetText: true,
          },
          where: { isActive: true },
        })
      : await prisma.$queryRawUnsafe<PublicTranslationEntry[]>(
          "SELECT sourceText, targetText FROM TranslationEntry WHERE isActive = true ORDER BY sourceText ASC",
        );

    return entries.filter(
      (entry) => entry.sourceText.trim() && entry.targetText.trim(),
    );
  } catch {
    return [];
  }
}

export const getPublicTranslations = unstable_cache(
  readPublicTranslations,
  ["public-translations"],
  {
    revalidate: 300,
    tags: ["public-translations"],
  },
);
