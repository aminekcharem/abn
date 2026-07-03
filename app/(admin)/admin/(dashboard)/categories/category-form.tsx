"use client";

import { useRef, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";

import { createCategoryAction } from "./actions";
import { categoryIconOptions } from "./category-icons";
import { Button } from "@/components/ui/button";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CategoryForm({ nextOrder }: { nextOrder: number }) {
  const formRef = useRef<HTMLFormElement>(null);
  const slugRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  function action(formData: FormData) {
    startTransition(async () => {
      await createCategoryAction(formData);
      formRef.current?.reset();
    });
  }

  return (
    <form action={action} className="grid gap-4" ref={formRef}>
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-zinc-200">
          Nom
          <input
            className={inputClass}
            name="name"
            onChange={(event) => {
              if (slugRef.current) {
                slugRef.current.value = slugify(event.target.value);
              }
            }}
            placeholder="Citadine premium"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-zinc-200">
          Slug
          <input
            className={inputClass}
            name="slug"
            placeholder="citadine-premium"
            ref={slugRef}
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-zinc-200">
          Icone
          <select className={inputClass} defaultValue="car" name="icon">
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
            defaultValue={nextOrder}
            min="0"
            name="order"
            type="number"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium text-zinc-200">
        Image personnalisee PNG, JPG, SVG ou WebP
        <input
          accept="image/svg+xml,image/png,image/jpeg,image/webp"
          className="rounded-md border border-dashed border-zinc-700 bg-zinc-950 px-3 py-3 text-sm text-zinc-100 file:mr-4 file:rounded-md file:border-0 file:bg-[#ffc10a] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[#050b20]"
          name="visual"
          type="file"
        />
        <span className="text-xs text-zinc-500">
          Optionnel. PNG, JPG et JPEG seront convertis en WebP.
        </span>
      </label>

      <label className="grid gap-2 text-sm font-medium text-zinc-200">
        Description front-end
        <textarea
          className="min-h-24 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm text-zinc-100 outline-none ring-primary/30 transition focus:ring-4"
          name="description"
          placeholder="Courte description affichée dans la section Parcourir par type."
        />
      </label>

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <label className="flex items-center gap-3 text-sm font-medium text-zinc-200">
          <input
            className="h-4 w-4 accent-primary"
            defaultChecked
            name="isActive"
            type="checkbox"
          />
          Activer la categorie sur le front-end
        </label>
        <label className="flex items-center gap-3 text-sm font-medium text-zinc-200">
          <input
            className="h-4 w-4 accent-primary"
            defaultChecked
            name="showOnHomepage"
            type="checkbox"
          />
          Afficher dans le bloc home
        </label>
        <label className="flex items-center gap-3 text-sm font-medium text-zinc-200">
          <input
            className="h-4 w-4 accent-primary"
            defaultChecked
            name="showOnCategoriesPage"
            type="checkbox"
          />
          Afficher dans la page categories
        </label>
        <Button disabled={isPending} type="submit">
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Ajouter la categorie
        </Button>
      </div>
    </form>
  );
}

const inputClass =
  "h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none ring-primary/30 transition focus:ring-4";
