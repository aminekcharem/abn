import {
  createOptionAction,
  updateOptionCategoryAction,
} from "./actions";
import {
  DeleteOptionButton,
  DeleteOptionCategoryButton,
} from "./delete-option-controls";
import { OptionsActionsPanel } from "./options-actions-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getOptionCategories() {
  try {
    const prisma = getPrisma();

    return await prisma.optionCategory.findMany({
      include: {
        options: {
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        },
      },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    });
  } catch {
    return [];
  }
}

export default async function AdminOptionsPage() {
  const categories = await getOptionCategories();
  const nextOrder =
    categories.reduce((max, category) => Math.max(max, category.order), 0) + 1;

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Options</h2>
          <p className="mt-2 text-zinc-400">
            Gere les categories d&apos;options, leurs icones SVG et les options du
            formulaire vehicule.
          </p>
        </div>
      </div>

      <OptionsActionsPanel
        categories={categories.map((category) => ({
          id: category.id,
          name: category.name,
        }))}
        nextOrder={nextOrder}
      />

      <Card className="admin-options-page border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-zinc-100">Categories & options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {categories.map((category) => (
              <section
                className="rounded-md border border-zinc-800 bg-zinc-950 p-4"
                key={category.id}
              >
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
                  <div>
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-zinc-800 bg-zinc-900 text-[#a21d2f]">
                        {category.iconSvg ? (
                          <span
                            className="grid h-5 w-5 place-items-center [&_svg]:h-5 [&_svg]:w-5"
                            dangerouslySetInnerHTML={{
                              __html: category.iconSvg,
                            }}
                          />
                        ) : (
                          <span className="text-xs font-semibold">
                            {category.order}
                          </span>
                        )}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-zinc-100">
                            {category.name}
                          </h3>
                          <Badge
                            className={
                              category.isActive
                                ? "border-[#a21d2f]/40 bg-[#a21d2f]/10 text-[#a21d2f]"
                                : "border-zinc-700 bg-zinc-800 text-zinc-400"
                            }
                            variant="outline"
                          >
                            {category.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-zinc-500">
                          {category.slug} - {category.options.length} option
                          {category.options.length > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {category.options.length ? (
                        category.options.map((option) => (
                          <span
                            className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-300"
                            key={option.id}
                          >
                            {option.name}
                            <DeleteOptionButton
                              optionId={option.id}
                              optionName={option.name}
                            />
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-zinc-500">
                          Aucune option dans cette categorie.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-3 rounded-md border border-zinc-800 bg-zinc-900 p-3">
                    <form
                      action={updateOptionCategoryAction.bind(null, category.id)}
                      className="grid gap-3"
                    >
                      <div className="grid gap-2 sm:grid-cols-2">
                        <label className={labelClass}>
                          Nom
                          <input
                            className={inputClass}
                            defaultValue={category.name}
                            name="name"
                            required
                          />
                        </label>
                        <label className={labelClass}>
                          Slug
                          <input
                            className={inputClass}
                            defaultValue={category.slug}
                            name="slug"
                            required
                          />
                        </label>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-[100px_1fr]">
                        <label className={labelClass}>
                          Ordre
                          <input
                            className={inputClass}
                            defaultValue={category.order}
                            min="0"
                            name="order"
                            type="number"
                          />
                        </label>
                        <label className="flex items-center gap-3 pt-5 text-sm font-medium text-zinc-200">
                          <input
                            className="h-4 w-4 accent-primary"
                            defaultChecked={category.isActive}
                            name="isActive"
                            type="checkbox"
                          />
                          Active
                        </label>
                      </div>
                      <label className={labelClass}>
                        Remplacer l&apos;icone SVG
                        <input
                          accept="image/svg+xml"
                          className="rounded-md border border-zinc-800 bg-black px-3 py-2 text-xs text-zinc-100 file:mr-3 file:rounded-md file:border-0 file:bg-[#a21d2f] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                          name="iconSvgFile"
                          type="file"
                        />
                      </label>
                      {category.iconSvg ? (
                        <label className="flex items-center gap-3 text-sm font-medium text-zinc-200">
                          <input
                            className="h-4 w-4 accent-primary"
                            name="removeIcon"
                            type="checkbox"
                          />
                          Supprimer l&apos;icone SVG
                        </label>
                      ) : null}
                      <Button
                        className="w-max bg-[#a21d2f] text-white hover:bg-[#050b20] hover:text-white"
                        type="submit"
                      >
                        Enregistrer categorie
                      </Button>
                    </form>
                    <DeleteOptionCategoryButton
                      categoryId={category.id}
                      categoryName={category.name}
                      disabled={category.options.length > 0}
                    />
                  </div>
                </div>

                <form
                  action={createOptionAction}
                  className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]"
                >
                  <input name="categoryId" type="hidden" value={category.id} />
                  <input
                    className={inputClass}
                    name="name"
                    placeholder={`Ajouter une option dans ${category.name}`}
                    required
                  />
                  <Button
                    className="bg-[#a21d2f] text-white hover:bg-[#050b20] hover:text-white"
                    type="submit"
                  >
                    Ajouter option
                  </Button>
                </form>
              </section>
            ))}

            {!categories.length ? (
              <div className="rounded-md border border-zinc-800 bg-zinc-950 p-10 text-center text-sm text-zinc-500">
                Aucune categorie d&apos;options. Ajoutez-en une ou lancez le seed.
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const inputClass =
  "h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none ring-primary/30 transition focus:ring-4";

const labelClass = "grid gap-2 text-sm font-medium text-zinc-200";

