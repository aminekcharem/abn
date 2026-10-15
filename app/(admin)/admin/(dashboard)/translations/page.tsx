import {
  createTranslationAction,
  syncDetectedTranslationsAction,
  updateTranslationAction,
} from "./actions";
import { TranslationsSearchList } from "./translations-search-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type TranslationRow = {
  id: string;
  sourceText: string;
  targetText: string;
  isActive: boolean;
};

async function getTranslations() {
  try {
    const prisma = getPrisma();
    const translationEntry = (
      prisma as ReturnType<typeof getPrisma> & {
        translationEntry?: {
          findMany: (args: unknown) => Promise<TranslationRow[]>;
        };
      }
    ).translationEntry;

    if (translationEntry) {
      return await translationEntry.findMany({
        orderBy: [{ sourceText: "asc" }],
      });
    }

    return await prisma.$queryRawUnsafe<TranslationRow[]>(
      "SELECT id, sourceText, targetText, isActive FROM TranslationEntry ORDER BY sourceText ASC",
    );
  } catch {
    return [];
  }
}

export default async function AdminTranslationsPage() {
  const translations = await getTranslations();

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Translate</h2>
          <p className="mt-2 text-zinc-400">
            Gere les mots et phrases en francais avec leur correspondance en
            anglais pour le site public.
          </p>
        </div>
        <form action={syncDetectedTranslationsAction}>
          <Button
            className="bg-[#a21d2f] text-white hover:bg-[#050b20] hover:text-white"
            type="submit"
          >
            Synchroniser les textes detectes
          </Button>
        </form>
      </div>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-zinc-100">Ajouter une traduction</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createTranslationAction} className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
            <label className={labelClass}>
              Mot ou phrase en francais
              <textarea
                className={`${textareaClass} min-h-24`}
                name="sourceText"
                placeholder="Ex: Nos véhicules"
                required
              />
            </label>
            <label className={labelClass}>
              Correspondance en anglais
              <textarea
                className={`${textareaClass} min-h-24`}
                name="targetText"
                placeholder="Ex: Our vehicles"
                required
              />
            </label>
            <div className="grid gap-3">
              <label className="flex items-center gap-3 text-sm font-medium text-zinc-200">
                <input
                  className="h-4 w-4 accent-primary"
                  defaultChecked
                  name="isActive"
                  type="checkbox"
                />
                Active
              </label>
              <Button
                className="bg-[#a21d2f] text-white hover:bg-[#050b20] hover:text-white"
                type="submit"
              >
                Ajouter
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-zinc-100">
            Liste des traductions ({translations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TranslationsSearchList count={translations.length}>
            {translations.map((translation) => (
              <form
                action={updateTranslationAction}
                className="grid gap-3 rounded-md border border-zinc-800 bg-zinc-950 p-4 xl:grid-cols-[1fr_1fr_130px]"
                data-search={`${translation.sourceText} ${translation.targetText}`}
                data-translation-row
                key={translation.id}
              >
                <input name="id" type="hidden" value={translation.id} />
                <input
                  name="originalSourceText"
                  type="hidden"
                  value={translation.sourceText}
                />
                <label className={labelClass}>
                  Francais
                  <textarea
                    className={textareaClass}
                    defaultValue={translation.sourceText}
                    name="sourceText"
                    required
                  />
                </label>
                <label className={labelClass}>
                  Anglais
                  <textarea
                    className={textareaClass}
                    defaultValue={translation.targetText}
                    name="targetText"
                    required
                  />
                </label>
                <div className="flex flex-wrap items-center gap-3 xl:flex-col xl:items-start xl:justify-end">
                  <label className="flex items-center gap-3 text-sm font-medium text-zinc-200">
                    <input
                      className="h-4 w-4 accent-primary"
                      defaultChecked={Boolean(translation.isActive)}
                      name="isActive"
                      type="checkbox"
                    />
                    Active
                  </label>
                  <Button
                    className="bg-[#a21d2f] text-white hover:bg-[#050b20] hover:text-white"
                    type="submit"
                  >
                    Modifier
                  </Button>
                </div>
              </form>
            ))}

            {!translations.length ? (
              <div className="rounded-md border border-dashed border-zinc-800 bg-zinc-950 p-10 text-center text-sm text-zinc-500">
                Aucune traduction trouvee. Lancez les migrations ou ajoutez une
                premiere correspondance.
              </div>
            ) : null}
          </TranslationsSearchList>
        </CardContent>
      </Card>
    </div>
  );
}

const textareaClass =
  "min-h-20 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-primary/30 transition focus:ring-4";

const labelClass = "grid gap-2 text-sm font-medium text-zinc-200";

