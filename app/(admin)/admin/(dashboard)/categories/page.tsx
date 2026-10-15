import {
  BadgeCheck,
  Car,
  CarFront,
  Gauge,
  Mountain,
  Sparkles,
  Truck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  updateCategoryAction,
  toggleCategoryStatusAction,
  updateCategoryVisualAction,
} from "./actions";
import { CategoriesActionsPanel } from "./categories-actions-panel";
import { categoryIconOptions } from "./category-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMediaUrl } from "@/lib/cdn";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getCategories() {
  try {
    const prisma = getPrisma();

    return await prisma.category.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: {
        description: true,
        icon: true,
        id: true,
        image: true,
        isActive: true,
        name: true,
        order: true,
        showOnCategoriesPage: true,
        slug: true,
        _count: {
          select: { vehicles: true },
        },
      },
    });
  } catch {
    return [];
  }
}

const iconMap: Record<string, LucideIcon> = {
  "badge-check": BadgeCheck,
  "car-front": CarFront,
  car: Car,
  gauge: Gauge,
  mountain: Mountain,
  sparkles: Sparkles,
  suv: Truck,
  truck: Truck,
  users: Users,
  wagon: CarFront,
};

export default async function AdminCategoriesPage() {
  const categories = await getCategories();
  const nextOrder =
    categories.reduce((max, category) => Math.max(max, category.order), 0) + 1;

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Categories</h2>
          <p className="mt-2 text-zinc-400">
            Organisez les types de vehicules affiches sur le showroom.
          </p>
        </div>
      </div>

      <CategoriesActionsPanel nextOrder={nextOrder} />

      <Card className="admin-categories-page border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-zinc-100">Liste des categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {categories.map((category) => {
              const Icon = iconMap[category.icon || "car"] ?? Car;

              return (
                <section
                  className="rounded-md border border-zinc-800 bg-zinc-950 p-4"
                  key={category.id}
                >
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
                    <div>
                      <div className="flex items-start gap-3">
                        <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-md border border-[#a21d2f]/30 bg-[#a21d2f]/10 text-[#a21d2f]">
                          {category.image ? (
                            <Image
                              alt=""
                              className="h-full w-full object-contain p-1"
                              height={48}
                              src={getMediaUrl(category.image)}
                              unoptimized
                              width={48}
                            />
                          ) : (
                            <Icon className="h-5 w-5" />
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
                            <Badge
                              className={
                                category.showOnCategoriesPage
                                  ? "border-sky-400/40 bg-sky-400/10 text-sky-200"
                                  : "border-zinc-700 bg-zinc-800 text-zinc-400"
                              }
                              variant="outline"
                            >
                              Page categories
                            </Badge>
                          </div>
                          <p className="mt-1 text-xs text-zinc-500">
                            Ordre {category.order} - {category.slug} -{" "}
                            {category._count.vehicles} vehicule
                            {category._count.vehicles > 1 ? "s" : ""}
                          </p>
                          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
                            {category.description || "Aucune description."}
                          </p>
                        </div>
                      </div>

                      <form
                        action={updateCategoryVisualAction}
                        className="mt-4 grid gap-2 rounded-md border border-zinc-800 bg-zinc-900 p-3 sm:grid-cols-[1fr_auto]"
                      >
                        <input name="id" type="hidden" value={category.id} />
                        <input
                          accept="image/svg+xml,image/png,image/jpeg,image/webp"
                          className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 file:mr-3 file:rounded-md file:border-0 file:bg-[#a21d2f] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
                          name="visual"
                          type="file"
                        />
                        <button
                          className="rounded-md bg-[#a21d2f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#050b20] hover:text-white"
                          type="submit"
                        >
                          Remplacer visuel
                        </button>
                      </form>
                    </div>

                    <form
                      action={updateCategoryAction.bind(null, category.id)}
                      className="grid gap-3 rounded-md border border-zinc-800 bg-zinc-900 p-3"
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
                      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_132px] sm:items-end">
                        <label className={labelClass}>
                          Icone
                          <select
                            className={inputClass}
                            defaultValue={category.icon || "car"}
                            name="icon"
                          >
                            {categoryIconOptions.map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="grid gap-1 rounded-md border border-zinc-800 bg-black/25 px-3 py-2 text-xs font-medium text-zinc-400">
                          <span>Ordre</span>
                          <input
                            className="h-9 w-full rounded-md border border-zinc-800 bg-zinc-950 px-2 text-center text-sm font-semibold text-zinc-100 outline-none ring-primary/30 transition focus:ring-4"
                            defaultValue={category.order}
                            min="0"
                            name="order"
                            type="number"
                          />
                        </label>
                      </div>
                      <label className={labelClass}>
                        Description
                        <textarea
                          className="min-h-24 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none ring-primary/30 transition focus:ring-4"
                          defaultValue={category.description || ""}
                          name="description"
                        />
                      </label>
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="flex items-center gap-3 text-sm font-medium text-zinc-200">
                          <input
                            className="h-4 w-4 accent-primary"
                            defaultChecked={category.isActive}
                            name="isActive"
                            type="checkbox"
                          />
                          Active
                        </label>
                        <label className="flex items-center gap-3 text-sm font-medium text-zinc-200">
                          <input
                            className="h-4 w-4 accent-primary"
                            defaultChecked={category.showOnCategoriesPage}
                            name="showOnCategoriesPage"
                            type="checkbox"
                          />
                          Page categories
                        </label>
                        <button
                          className="rounded-md bg-[#a21d2f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#050b20] hover:text-white"
                          type="submit"
                        >
                          Enregistrer categorie
                        </button>
                        <Link
                          className="rounded-md border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-800 hover:text-white"
                          href={`/admin/categories/${category.id}/edit`}
                        >
                          Page detail
                        </Link>
                      </div>
                    </form>
                  </div>

                  <form action={toggleCategoryStatusAction} className="mt-4">
                    <input name="id" type="hidden" value={category.id} />
                    <input
                      name="isActive"
                      type="hidden"
                      value={category.isActive ? "false" : "true"}
                    />
                    <button className="text-sm font-semibold text-[#a21d2f] transition hover:text-white" type="submit">
                      {category.isActive ? "Desactiver" : "Activer"} rapidement
                    </button>
                  </form>
                </section>
              );
            })}

            {!categories.length ? (
              <div className="rounded-md border border-zinc-800 bg-zinc-950 p-10 text-center text-sm text-zinc-500">
                Aucune categorie trouvee. Lancez le seed Prisma.
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

