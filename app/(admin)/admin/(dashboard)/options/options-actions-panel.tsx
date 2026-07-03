"use client";

import { useState } from "react";
import { ListPlus, Tags } from "lucide-react";

import {
  createOptionAction,
  createOptionCategoryAction,
} from "./actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type OptionCategoryChoice = {
  id: string;
  name: string;
};

export function OptionsActionsPanel({
  categories,
  nextOrder,
}: {
  categories: OptionCategoryChoice[];
  nextOrder: number;
}) {
  const [activeForm, setActiveForm] = useState<"category" | "option" | null>(
    null,
  );

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        <Button
          className={
            activeForm === "category"
              ? "bg-[#ffc10a] text-[#050b20] hover:bg-[#050b20] hover:text-white"
              : "border-zinc-700 bg-zinc-950 text-zinc-100 hover:bg-zinc-800 hover:text-white"
          }
          onClick={() =>
            setActiveForm((current) =>
              current === "category" ? null : "category",
            )
          }
          type="button"
          variant={activeForm === "category" ? "default" : "outline"}
        >
          <Tags className="h-4 w-4" />
          Ajouter une categorie
        </Button>
        <Button
          className={
            activeForm === "option"
              ? "bg-[#ffc10a] text-[#050b20] hover:bg-[#050b20] hover:text-white"
              : "border-zinc-700 bg-zinc-950 text-zinc-100 hover:bg-zinc-800 hover:text-white"
          }
          disabled={!categories.length}
          onClick={() =>
            setActiveForm((current) => (current === "option" ? null : "option"))
          }
          type="button"
          variant={activeForm === "option" ? "default" : "outline"}
        >
          <ListPlus className="h-4 w-4" />
          Ajouter une option
        </Button>
      </div>

      {activeForm ? (
        <div className="rounded-md border border-zinc-800 bg-zinc-900 p-4">
          {activeForm === "category" ? (
            <form
              action={createOptionCategoryAction}
              className="grid gap-4 lg:grid-cols-4"
            >
              <label className={labelClass}>
                Nom
                <input
                  className={inputClass}
                  name="name"
                  placeholder="Confort"
                  required
                />
              </label>
              <label className={labelClass}>
                Slug
                <input
                  className={inputClass}
                  name="slug"
                  placeholder="confort"
                />
              </label>
              <label className={labelClass}>
                Ordre
                <input
                  className={inputClass}
                  defaultValue={nextOrder}
                  min="0"
                  name="order"
                  type="number"
                />
              </label>
              <label className="flex items-center gap-3 pt-7 text-sm font-medium text-zinc-200">
                <input
                  className="h-4 w-4 accent-primary"
                  defaultChecked
                  name="isActive"
                  type="checkbox"
                />
                Active
              </label>
              <label className={cn(labelClass, "lg:col-span-2")}>
                Icone SVG
                <input
                  accept="image/svg+xml"
                  className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 file:mr-3 file:rounded-md file:border-0 file:bg-[#ffc10a] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#050b20]"
                  name="iconSvgFile"
                  type="file"
                />
              </label>
              <label className={cn(labelClass, "lg:col-span-2")}>
                Ou coller le SVG
                <textarea
                  className="min-h-20 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 outline-none ring-primary/30 transition focus:ring-4"
                  name="iconSvgText"
                  placeholder="<svg ...></svg>"
                />
              </label>
              <div className="flex items-end lg:col-span-4">
                <Button
                  className="bg-[#ffc10a] text-[#050b20] hover:bg-[#050b20] hover:text-white"
                  type="submit"
                >
                  Ajouter categorie
                </Button>
              </div>
            </form>
          ) : (
            <form
              action={createOptionAction}
              className="grid gap-4 lg:grid-cols-[320px_1fr_auto]"
            >
              <label className={labelClass}>
                Categorie
                <select className={inputClass} name="categoryId" required>
                  <option value="">Selectionner</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                Option
                <input
                  className={inputClass}
                  name="name"
                  placeholder="Sieges chauffants"
                  required
                />
              </label>
              <div className="flex items-end">
                <Button
                  className="bg-[#ffc10a] text-[#050b20] hover:bg-[#050b20] hover:text-white"
                  type="submit"
                >
                  Ajouter option
                </Button>
              </div>
            </form>
          )}
        </div>
      ) : null}
    </div>
  );
}

const inputClass =
  "h-10 rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none ring-primary/30 transition focus:ring-4";

const labelClass = "grid gap-2 text-sm font-medium text-zinc-200";
