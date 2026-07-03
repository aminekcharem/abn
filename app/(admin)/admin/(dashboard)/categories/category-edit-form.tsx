"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useTransition } from "react";
import { Loader2, Save } from "lucide-react";

import { updateCategoryAction } from "./actions";
import { categoryIconOptions } from "./category-icons";
import { Button } from "@/components/ui/button";
import { getMediaUrl } from "@/lib/cdn";

type CategoryEditFormProps = {
  category: {
    description: string | null;
    icon: string | null;
    id: string;
    image: string | null;
    isActive: boolean;
    name: string;
    order: number;
    showOnCategoriesPage: boolean;
    slug: string;
  };
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CategoryEditForm({ category }: CategoryEditFormProps) {
  const slugRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const updateAction = updateCategoryAction.bind(null, category.id);

  function action(formData: FormData) {
    startTransition(async () => {
      await updateAction(formData);
    });
  }

  return (
    <form action={action} className="grid gap-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-zinc-200">
          Nom
          <input
            className={inputClass}
            defaultValue={category.name}
            name="name"
            onChange={(event) => {
              if (slugRef.current) {
                slugRef.current.value = slugify(event.target.value);
              }
            }}
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-zinc-200">
          Slug
          <input
            className={inputClass}
            defaultValue={category.slug}
            name="slug"
            ref={slugRef}
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-zinc-200">
          Icone prédéfinie
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
        <label className="grid gap-2 text-sm font-medium text-zinc-200">
          Ordre
          <input
            className={inputClass}
            defaultValue={category.order}
            min="0"
            name="order"
            type="number"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium text-zinc-200">
        Description front-end
        <textarea
          className="min-h-28 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm text-zinc-100 outline-none ring-primary/30 transition focus:ring-4"
          defaultValue={category.description || ""}
          name="description"
        />
      </label>

      <div className="grid gap-4 rounded-md border border-zinc-800 bg-zinc-950 p-4 lg:grid-cols-[140px_1fr]">
        <div>
          <p className="mb-2 text-sm font-medium text-zinc-200">Visuel actuel</p>
          <span className="grid h-24 w-24 place-items-center overflow-hidden rounded-md border border-zinc-800 bg-white p-3">
            {category.image ? (
              <Image
                alt=""
                className="h-full w-full object-contain"
                height={96}
                src={getMediaUrl(category.image)}
                unoptimized
                width={96}
              />
            ) : (
              <span className="text-xs font-semibold text-zinc-500">
                Icone preset
              </span>
            )}
          </span>
        </div>
        <div className="grid gap-3">
          <label className="grid gap-2 text-sm font-medium text-zinc-200">
            Remplacer par une image PNG, JPG, SVG ou WebP
            <input
              accept="image/svg+xml,image/png,image/jpeg,image/webp"
              className="rounded-md border border-dashed border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-zinc-100 file:mr-4 file:rounded-md file:border-0 file:bg-[#ffc10a] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[#050b20]"
              name="visual"
              type="file"
            />
          </label>
          {category.image ? (
            <label className="flex items-center gap-3 text-sm font-medium text-zinc-200">
              <input
                className="h-4 w-4 accent-primary"
                name="removeVisual"
                type="checkbox"
              />
              Supprimer le SVG/image et utiliser l&apos;icone prédéfinie
            </label>
          ) : null}
        </div>
      </div>

      <label className="flex items-center gap-3 text-sm font-medium text-zinc-200">
        <input
          className="h-4 w-4 accent-primary"
          defaultChecked={category.isActive}
          name="isActive"
          type="checkbox"
        />
        Activer la categorie sur le front-end
      </label>
      <div className="grid gap-3 rounded-md border border-zinc-800 bg-zinc-950 p-4">
        <label className="flex items-center gap-3 text-sm font-medium text-zinc-200">
          <input
            className="h-4 w-4 accent-primary"
            defaultChecked={category.showOnCategoriesPage}
            name="showOnCategoriesPage"
            type="checkbox"
          />
          Afficher dans la page categories
        </label>
      </div>

      <div className="flex flex-col justify-end gap-3 sm:flex-row">
        <Button asChild type="button" variant="outline">
          <Link href="/admin/categories">Annuler</Link>
        </Button>
        <Button disabled={isPending} type="submit">
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Enregistrer
        </Button>
      </div>
    </form>
  );
}

const inputClass =
  "h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none ring-primary/30 transition focus:ring-4";
